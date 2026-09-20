"""Blender-гүйгээр скриптийг ажиллуулж шалгах хуурамч bpy (зөвхөн тест)."""
import math

class IDProps:
    def __init__(self): self._p = {}
    def get(self, k, d=None): return self._p.get(k, d)
    def __getitem__(self, k): return self._p[k]
    def __setitem__(self, k, v): self._p[k] = v
    def __delitem__(self, k): del self._p[k]
    def __contains__(self, k): return k in self._p

class ID(IDProps):
    def __init__(self, name):
        IDProps.__init__(self); self.name = name; self.users = 0; self.use_fake_user = False

class FCurve:
    def __init__(self, path, index): self.data_path=path; self.array_index=index; self.keyframe_points=[]
    def update(self): pass

class KP:
    def __init__(self, co): self.co=co; self.interpolation="BEZIER"; self.handle_left_type="AUTO"; self.handle_right_type="AUTO"

class Action(ID):
    def __init__(self, name):
        ID.__init__(self, name); self.fcurves=[]; self.layers=[]

class AnimData:
    def __init__(self): self.action=None; self.action_slot=None

class Animatable(ID):
    def __init__(self, name):
        ID.__init__(self, name); self.animation_data=None
    def _ad(self):
        if self.animation_data is None:
            self.animation_data = AnimData()
            self.animation_data.action = data.actions.new(self.name+"Action")
            self.animation_data.action.users = 1     # Blender дээр хэрэглэгдэж эхэлнэ
        return self.animation_data
    def animation_data_clear(self):
        if self.animation_data and self.animation_data.action:
            self.animation_data.action.users -= 1
        self.animation_data = None
    def keyframe_insert(self, path, frame=1, index=-1):
        ad=self._ad(); act=ad.action
        vals=getattr(self, path)
        try: seq=list(vals)
        except TypeError: seq=[vals]
        for i,v in enumerate(seq):
            fc=None
            for f in act.fcurves:
                if f.data_path==path and f.array_index==i: fc=f; break
            if fc is None:
                fc=FCurve(path,i); act.fcurves.append(fc)
            fc.keyframe_points=[k for k in fc.keyframe_points if k.co[0]!=frame]
            fc.keyframe_points.append(KP((frame,v)))
        return True

class Mesh(ID):
    def __init__(self,name): ID.__init__(self,name); self.verts=[]; self.faces=[]
    def from_pydata(self,v,e,f):
        n=len(v)
        for face in f:
            for i in face:
                assert 0<=i<n, "mesh index out of range %d/%d" % (i,n)
        self.verts=v; self.faces=f
    def update(self): pass

class Camera(Animatable):
    def __init__(self,name):
        Animatable.__init__(self,name)
        self.sensor_fit="AUTO"; self.sensor_width=36.0; self.sensor_height=24.0
        self.lens=50.0; self.lens_unit="MILLIMETERS"; self.display_size=1.0
        self.clip_start=0.1; self.clip_end=100.0

class Object(Animatable):
    def __init__(self,name,d):
        Animatable.__init__(self,name)
        self.data=d
        if d is not None: d.users += 1
        self.location=(0.0,0.0,0.0); self.rotation_euler=[0.0,0.0,0.0]; self.scale=(1.0,1.0,1.0)
        self.rotation_quaternion=(1.0,0.0,0.0,0.0)
        self.rotation_mode="XYZ"; self.parent=None; self._children=[]
        self.display_type="TEXTURED"; self.hide_render=False; self.mode="OBJECT"
        self.empty_display_type="PLAIN_AXES"; self.empty_display_size=1.0
        self.users_collection=[]; self.matrix_world=Matrix()
    @property
    def children(self): return tuple(o for o in data.objects if o.parent is self)

class Matrix:
    def copy(self): return self

class Text(ID):
    def __init__(self,name): ID.__init__(self,name); self.body=""; self.filepath=""
    def clear(self): self.body=""
    def write(self,s): self.body+=s
    def as_string(self): return self.body

class Coll(ID):
    def __init__(self,name):
        ID.__init__(self,name); self.objects=CollObjects(self); self.children=CollChildren()
    @property
    def children_recursive(self):
        out=[]
        def walk(c):
            for k in c.children:
                out.append(k); walk(k)
        walk(self); return out

class CollObjects:
    def __init__(self,owner): self.owner=owner; self._l=[]
    def link(self,ob):
        assert ob not in self._l, "давхар link: "+ob.name
        self._l.append(ob); ob.users_collection.append(self.owner)
    def unlink(self,ob):
        self._l.remove(ob)
        if self.owner in ob.users_collection: ob.users_collection.remove(self.owner)
    def __iter__(self): return iter(list(self._l))
    def __len__(self): return len(self._l)
    def __contains__(self,k):
        return any(o.name==k for o in self._l) if isinstance(k,str) else k in self._l

class CollChildren:
    def __init__(self): self._l=[]
    def link(self,c):
        assert c not in self._l, "давхар collection link"
        self._l.append(c)
    def __iter__(self): return iter(list(self._l))
    def __len__(self): return len(self._l)
    def __contains__(self,k):
        return any(c.name==k for c in self._l) if isinstance(k,str) else k in self._l

class Store(list):
    def __init__(self,factory): list.__init__(self); self.factory=factory
    def _uniq(self,name):
        if not any(getattr(x,'name',None)==name for x in self): return name
        i=1
        while any(getattr(x,'name',None)=="%s.%03d"%(name,i) for x in self): i+=1
        return "%s.%03d"%(name,i)
    def new(self,name,d=None):
        o=self.factory(self._uniq(name),d) if self.factory is Object else self.factory(self._uniq(name))
        self.append(o); return o
    def get(self,name,default=None):
        for o in self:
            if o.name==name: return o
        return default
    def remove(self,o,do_unlink=False):
        for c in list(getattr(o,'users_collection',[])): c.objects.unlink(o)
        if getattr(o,'data',None) is not None: o.data.users-=1
        ad=getattr(o,'animation_data',None)
        if ad is not None and ad.action is not None: ad.action.users-=1
        for ch in list(getattr(o,'children',())): ch.parent=None
        self.remove_item(o)
    def remove_item(self,o): list.remove(self,o)

class Render:
    def __init__(self):
        self.fps=24; self.fps_base=1.0; self.resolution_x=1920
        self.resolution_y=1080; self.resolution_percentage=100
        self.pixel_aspect_x=1.0; self.pixel_aspect_y=1.0; self.use_border=False

class Scene(ID):
    def __init__(self,name):
        ID.__init__(self,name); self.render=Render(); self.frame_start=1; self.frame_end=250
        self.camera=None; self.collection=Coll("Scene Collection")
        self.frame_current=1; self.frame_step=1; self.timeline_markers=[]
    def frame_set(self,f): self.frame_current=f
    @property
    def objects(self):
        """Тайзан дээр аль нэг замаар холбогдсон бүх объект."""
        seen=[]
        def walk(c):
            for o in c.objects:
                if o not in seen: seen.append(o)
            for k in c.children: walk(k)
        walk(self.collection); return seen

class Data:
    def __init__(self):
        self.objects=Store(Object); self.meshes=Store(Mesh); self.cameras=Store(Camera)
        self.collections=Store(Coll); self.texts=Store(Text); self.actions=Store(Action)
        self.scenes=Store(Scene); self.filepath="/tmp/тест.blend"; self.is_saved=True
    def reset(self): self.__init__()

class WM:
    popups=[]
    def popup_menu(self,draw,title="",icon=""):
        lay=_Layout(); ctx=None
        class S: layout=lay
        draw(S(),ctx); WM.popups.append((title,list(lay.lines)))

class _Layout:
    def __init__(self): self.lines=[]
    def label(self,text=""): self.lines.append(text)

class ViewLayerObjects:
    def __init__(self): self.active=None

class ViewLayer:
    def __init__(self): self.objects=ViewLayerObjects()

class Context:
    def __init__(self): self.scene=None; self.view_layer=ViewLayer(); self.window_manager=WM()
    @property
    def mode(self):
        ob=self.view_layer.objects.active
        return "OBJECT" if ob is None else ("OBJECT" if ob.mode=="OBJECT" else "EDIT_MESH")

class _Ed:
    def undo_push(self,message=""): ops_log.append(("undo_push",message))
class _Wm:
    def save_as_mainfile(self,filepath="",copy=False):
        ops_log.append(("save_as_mainfile",filepath,copy))
        saved_copies.append(filepath)
class _ObjOps:
    def mode_set(self,mode="OBJECT"):
        ob=context.view_layer.objects.active
        if ob is None: raise RuntimeError("no active object")
        ob.mode=mode; ops_log.append(("mode_set",mode))
class Ops:
    def __init__(self): self.ed=_Ed(); self.object=_ObjOps(); self.wm=_Wm()

class App:
    version=(5,2,0)

class Operator:
    pass

class _Types:
    Operator=Operator

class _Utils:
    registered=[]
    def register_class(self,c):
        """Blender адилаар bl_idname давхцвал хуучныг нь соливол."""
        nm=getattr(c,'bl_idname',None)
        _Utils.registered=[x for x in _Utils.registered if getattr(x,'bl_idname',None)!=nm]
        _Utils.registered.append(c)
    def unregister_class(self,c):
        nm=getattr(c,'bl_idname',None)
        before=len(_Utils.registered)
        _Utils.registered=[x for x in _Utils.registered if getattr(x,'bl_idname',None)!=nm]
        if len(_Utils.registered)==before: raise RuntimeError("not registered")

ops_log=[]
saved_copies=[]
data=Data()
context=Context()
ops=Ops()
app=App()
types=_Types()
utils=_Utils()

def reset():
    global data, context, ops_log, saved_copies
    data.reset(); ops_log=[]; saved_copies=[]
    _Utils.registered=[]
    sc=data.scenes.new("Scene"); context.scene=sc
    context.view_layer=ViewLayer(); WM.popups=[]
    return sc
