/* ═════════════════════════════════════════════════════════════
   52 · Цэсний агуулга

   Бүх 13 цэсийг хэрэглэгчийн бодит DaVinci Resolve Studio 21-ийн
   дэлгэцээс уншиж баталсан — дараалал, тусгаарлагч, товчлуур,
   дэд цэсний сум бүгд тэндээс авсан.

   Мөрийн бүтэц:  [толины id, харагдах нэр, товчлуур?, "›" бол дэд цэстэй]
   "-" гэсэн мөр нь тусгаарлах зураас.
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  RM.sim.menus = {



    "fusion-page": { label: "Fusion", verified: true, items: [
      ["show-toolbar", "Show Toolbar", "✓"],
      ["fusion-settings", "Fusion Settings…"],
      ["reset-composition", "Reset Composition"],
      ["macro-editor", "Macro Editor…"],
      ["import-fusion", "Import", "", "›"],
      ["render-all-savers", "Render All Savers"]
    ]},

    /* File цэс — Media хуудсан дээр нээсэн 2026-09-19-ний зургаас: timeline-тэй холбоотой
       мөрүүд (New/Close Timeline, Timeline Backup, Quick Export, Reconform) Media дээр саарал;
       Revert — хадгалаагүй өөрчлөлт байхгүй үед; Single/Multiple User — Local төслийн санд. */
    "file-menu": { label: "File", verified: true, items: [
      ["new-project", "New Project…"],
      ["open-recent-project", "Open Recent Project", "", "›"],
      ["new-bin", "New Bin", "Ctrl+Shift+N"],
      ["new-smart-bin", "New Smart Bin…"],
      ["new-timeline", "New Timeline…", "Ctrl+N", "", "photo,cut,edit,fusion,color,fairlight,deliver"],
      ["close-timeline", "Close Timeline", "", "", "photo,cut,edit,fusion,color,fairlight,deliver"],
      ["close-project", "Close Project"],
      "-",
      ["save-project", "Save Project", "Ctrl+S"],
      ["save-as", "Save Project As…", "Ctrl+Shift+S"],
      ["create-timeline-backup", "Create Timeline Backup…", "Ctrl+Alt+S", "", "photo,cut,edit,fusion,color,fairlight,deliver"],
      "-",
      ["revert-to-last-saved-version", "Revert to Last Saved Version…", "", "", "state:unsaved"],
      "-",
      ["import-media", "Import", "", "›"],
      ["import-project", "Import Project…"],
      ["import-metadata-to", "Import Metadata To", "", "›"],
      "-",
      ["deliverable", "Export", "", "›"],
      ["export-project", "Export Project…", "Ctrl+E"],
      ["export-metadata-from", "Export Metadata From", "", "›"],
      "-",
      ["quick-export", "Quick Export…", "", "", "photo,cut,edit,fusion,color,fairlight,deliver"],
      "-",
      ["project-manager", "Project Manager…", "Shift+0"],
      ["project-settings", "Project Settings…", "Shift+9"],
      ["project-notes", "Project Notes…"],
      "-",
      ["single-user-project", "Single User Project", "✓", "", "state:collab"],
      ["multiple-user-collaboration", "Multiple User Collaboration", "", "", "state:collab"],
      "-",
      ["media-management", "Media Management…"],
      ["reconform-from-bins", "Reconform from Bins…", "", "", "photo,cut,edit,fusion,color,fairlight,deliver"],
      ["reconform-from-media-storage", "Reconform from Media Storage…", "", "", "photo,cut,edit,fusion,color,fairlight,deliver"],
      "-",
      ["setup-ai-assistants", "Setup AI Assistants…"],
      "-",
      ["easydcp", "easyDCP", "", "›"],
      ["dolby-vision", "Dolby Vision®", "", "›"],
      "-",
      ["blackmagic-cloud-account", "Blackmagic Cloud Account", "", "›"]
    ]},

    "trim-menu": { label: "Trim", verified: true, items: [
      ["normal-edit-mode", "Normal Edit Mode", "A"],
      ["trim-edit-mode", "Trim Mode", "T"],
      ["range-selection-mode", "Range Selection Mode", "R"],
      ["focus-mode", "Focus Mode", "W"],
      ["dynamic-trim", "Dynamic Trim Mode", "W"],
      ["toggle-slip-slide-mode", "Toggle Slip/Slide Mode", "S"],
      ["blade", "Blade Edit Mode", "B"],
      "-",
      ["trim-editor", "Trim Editor"],
      "-",
      ["select-nearest", "Select Nearest", "", "›"],
      ["select-all-clips-under-playhead", "Select All Clips Under Playhead", "Alt+Shift+V"],
      ["edit-point-type", "Edit Point Type", "U"],
      ["toggle-v-plusa-v-a", "Toggle V+A/V/A", "Alt+U"],
      "-",
      ["select-nearest", "Select Nearest Edit To", "", "›"],
      ["select-nearest", "Select Nearest Clip To", "", "›"],
      ["nudge", "Nudge", "", "›"],
      "-",
      ["trim-start", "Trim Start", "Shift+["],
      ["trim-end", "Trim End", "Shift+]"],
      ["trim-to-selection", "Trim to Selection"],
      ["extend-edit", "Extend Edit", "E"],
      "-",
      ["resize", "Resize", "", "›"],
      ["ripple-trim", "Ripple", "", "›"],
      ["roll", "Roll", "", "›"],
      "-",
      ["slip-playhead-to", "Slip Playhead To", "", "›"],
      "-",
      ["fade-in-to-playhead", "Fade In to Playhead", "Alt+Shift+D"],
      ["fade-out-to-playhead", "Fade Out to Playhead", "Alt+Shift+G"],
      ["crossfade-selection", "Crossfade Selection"],
      "-",
      ["slip-audio", "Slip Audio", "", "›"],
      ["slip-eye", "Slip Eye", "", "›"]
    ]},

    "timeline-menu": { label: "Timeline", verified: true, items: [
      ["add-transition", "Add Transition", "Ctrl+T"],
      ["add-video-only-transition", "Add Video Only Transition", "Alt+T"],
      ["add-audio-transition", "Add Audio Only Transition", "Shift+T"],
      "-",
      ["select-all", "Select Clips", "", "›"],
      ["select-transitions", "Select Transitions"],
      "-",
      ["razor", "Razor", "Ctrl+B"],
      ["split-clip", "Split Clips", "Ctrl+\\"],
      ["join-clips", "Join Clips", "Alt+\\"],
      ["scene-cut-detection", "Detect Scene Cuts"],
      "-",
      ["ai-tools", "AI Tools", "", "›"],
      "-",
      ["multicam-editing", "Multicam Editing", "Ctrl+Shift+\\"],
      ["record-voiceover", "Record Voiceover…"],
      "-",
      ["audio-operations", "Audio", "", "›"],
      ["video-track-enable", "Video", "", "›"],
      "-",
      ["match-frame", "Match Frame", "F"],
      "-",
      ["snapping", "Snapping", "N"],
      ["linked-selection", "Linked Selection", "Ctrl+Shift+L"],
      "-",
      ["source-track-selector", "Source Track Selector", "", "›"],
      ["auto-select", "Auto Select", "", "›"],
      ["track-lock", "Track Lock", "", "›"],
      ["sync-lock", "Sync Lock", "", "›"],
      ["video-track-enable", "Video Track Enable", "", "›"],
      "-",
      ["output-blanking", "Output Blanking", "", "›"],
      "-",
      ["load-current-timeline-to-source-viewer", "Load Current Timeline to Source Viewer"],
      ["find-current-timeline-in-media-pool", "Find Current Timeline in Media Pool"]
    ]},

    "clip-menu": { label: "Clip", verified: true, items: [
      ["compound-clip", "New Compound Clip…"],
      ["fusion-clip", "New Fusion Clip…"],
      ["new-vfx-connect-clip", "New VFX Connect Clip…"],
      "-",
      ["open-in-timeline", "Open in Timeline"],
      ["decompose", "Decompose in Place"],
      ["split-layers-in-place", "Split Layers in Place"],
      "-",
      ["enable-disable-clip", "Enable/Disable Clip", "D"],
      ["link-clips", "Link Clips", "Ctrl+Alt+L"],
      "-",
      ["change-clip-duration", "Change Clip Duration…", "Ctrl+D"],
      "-",
      ["clip-speed", "Clip Speed", "", "›"],
      ["fusion-referenced-compositions", "Fusion Referenced Compositions", "", "›"],
      ["auto-align-clips", "Auto Align Clips"],
      "-",
      ["ai-tools", "AI Tools", "", "›"],
      ["audio-operations", "Audio Operations", "", "›"],
      "-",
      ["take-selector", "Take Selector"],
      ["finalize-take", "Finalize Take"],
      "-",
      ["multicam-cut", "Multicam Cut", "", "›"],
      ["multicam-switch", "Multicam Switch", "", "›"],
      "-",
      ["render-cache", "Render Cache", "", "›"],
      "-",
      ["conform-lock-enabled", "Conform Lock Enabled"],
      ["conform-lock-enabled", "Conform Lock With Media Pool Clip"],
      "-",
      ["find-clip-in-media-pool", "Find Clip in Media Pool", "Alt+F"],
      ["match-frame-to-source-clip", "Match Frame to Source Clip"]
    ]},

    "mark-menu": { label: "Mark", verified: true, items: [
      ["mark-in", "Mark In", "I"],
      ["mark-out", "Mark Out", "O"],
      ["mark-video-in", "Mark Video In", "Alt+Shift+I"],
      ["mark-video-out", "Mark Video Out", "Alt+Shift+O"],
      ["mark-audio-in", "Mark Audio In", "Ctrl+Alt+I"],
      ["mark-audio-out", "Mark Audio Out", "Ctrl+Alt+O"],
      "-",
      ["convert-in-and-out-to-duration-marker", "Convert In and Out to Duration Marker"],
      ["set-in-and-out-from-duration-marker", "Set In and Out from Duration Marker"],
      "-",
      ["clear-in", "Clear In", "Alt+I"],
      ["clear-out", "Clear Out", "Alt+O"],
      ["clear-in-and-out", "Clear In and Out", "Alt+X"],
      ["clear-video-in-and-out", "Clear Video In and Out", "Alt+Shift+X"],
      ["clear-audio-in-and-out", "Clear Audio In and Out", "Ctrl+Alt+X"],
      "-",
      ["mark-clip", "Mark Clip", "X"],
      ["mark-selection", "Mark Selection", "Shift+A"],
      ["create-subclip", "Create Subclip", "Alt+B"],
      "-",
      ["keyframe-timeline-mode", "Keyframe Timeline Mode", "", "›"],
      "-",
      ["add-keyframe", "Add Keyframe", "Ctrl+["],
      ["add-static-keyframe", "Add Static Keyframe", "Ctrl+]"],
      ["delete-keyframe", "Delete Keyframe", "Alt+]"],
      ["delete-all-keyframes", "Delete All Keyframes"],
      "-",
      ["keyframe-editor", "Move Selected Keyframes Left"],
      ["keyframe-editor", "Move Selected Keyframes Right"],
      ["keyframe-editor", "Move Selected Keyframes Up"],
      ["keyframe-editor", "Move Selected Keyframes Down"],
      "-",
      ["marker", "Add Marker", "M", "›"],
      ["add-and-modify-marker", "Add and Modify Marker…", "Ctrl+M"],
      ["modify-marker", "Modify Marker…", "Shift+M"],
      ["delete-marker", "Delete Marker", "Alt+M"],
      ["delete-all-markers", "Delete All Markers", "", "›"],
      "-",
      ["favorite-keywords", "Favorite Keywords", "", "›"],
      "-",
      ["add-flag", "Add Flag", "", "›"],
      ["clear-flags", "Clear Flags"],
      ["clear-flags", "Delete All Flags", "", "›"],
      "-",
      ["set-clip-color", "Set Clip Color", "", "›"]
    ]},

    "view-menu": { label: "View", verified: true, items: [
      ["bypass-color-and-fusion", "Bypass Color and Fusion", "", "›"],
      ["display-broadcast-safe-exceptions", "Display Broadcast Safe Exceptions"],
      "-",
      ["source-timeline-viewer", "Source/Timeline Viewer", "Q"],
      ["source-clip-source-tape", "Source Clip/Source Tape", "Shift+Q"],
      ["toggle-source-timeline", "Toggle Source Timeline", "Alt+Q"],
      "-",
      ["zoom-slider", "Zoom", "", "›"],
      ["zoom-around-mouse-pointer", "Zoom Around Mouse Pointer"],
      ["zoom-audio-waveform", "Zoom Audio Waveform", "", "›"],
      "-",
      ["safe-area", "Safe Area", "", "›"],
      ["rulers", "Rulers", "", "›"],
      ["guides", "Guides", "", "›"],
      "-",
      ["show-spelling-errors-on-viewer", "Show Spelling Errors on Viewer", "✓"],
      "-",
      ["switch-eye-to", "Switch Eye To", "", "›"],
      ["viewer-overlay", "Viewer Overlay", "", "›"],
      ["show-duplicate-frames", "Show Duplicate Frames"],
      "-",
      ["show-file-names", "Show File Names"],
      ["audio-sync", "Overlay Synced Audio File Names", "✓"],
      ["show-audio-track-layers", "Show Audio Track Layers"],
      "-",
      ["show-subtitle-regions", "Show Subtitle Regions", "✓"],
      "-",
      ["timeline-thumbnail-mode", "Timeline Thumbnail Mode", "", "›"],
      ["timeline-thumbnail-mode", "Timeline Thumbnail Info", "", "›"],
      ["timeline-thumbnail-mode", "Timeline Thumbnail Size", "", "›"],
      "-",
      ["show-current-clip-with-handles", "Show Current Clip With Handles"],
      "-",
      ["marker", "Show Markers", "", "›"],
      ["flag", "Show Flags", "", "›"],
      "-",
      ["timeline-scrolling", "Timeline Scrolling", "", "›"],
      ["show-preview-marks", "Show Preview Marks"],
      ["enable-multiview-edit-preview", "Enable Multiview Edit Preview", "✓"]
    ]},

    "playback-menu": { label: "Playback", verified: true, items: [
      ["use-optimized-media-if-available", "Use Optimized Media if Available", "✓"],
      ["proxy-handling", "Proxy Handling", "", "›"],
      "-",
      ["timeline-playback-resolution", "Timeline Playback Resolution", "", "›"],
      ["photo-album-preview-resolution", "Photo Album Preview Resolution", "", "›"],
      "-",
      ["render-cache", "Render Cache", "", "›"],
      ["render-cache", "Delete Render Cache", "", "›"],
      ["manage-render-cache", "Manage Render Cache…"],
      "-",
      ["fusion-memory-cache", "Fusion Memory Cache", "", "›"],
      "-",
      ["j", "Play Reverse", "J"],
      ["k", "Stop", "K"],
      ["l", "Play Forward", "L"],
      ["play-stop", "Pause/Start Playback", "Space"],
      ["play-again", "Play Again", "Alt+L"],
      ["playback-post-roll", "Playback Post Roll"],
      ["stop-and-go-to-last-position", "Stop and Go to Last Position"],
      "-",
      ["record-voiceover", "Record"],
      "-",
      ["fast-reverse", "Fast Reverse", "Shift+J"],
      ["fast-forward", "Fast Forward", "Shift+L"],
      ["play-slow", "Play Slow", "Shift+K"],
      ["fast-review", "Fast Review"],
      ["loop-unloop", "Loop/Unloop", "Ctrl+/"],
      ["play-around-to", "Play Around/To", "", "›"],
      "-",
      ["timecode", "Timecode", "", "›"],
      ["go-to", "Go To", "", "›"],
      ["step-one", "Step One", "", "›"],
      ["previous-edit", "Previous", "", "›"],
      ["next-edit", "Next", "", "›"],
      "-",
      ["jump-left", "Jump Left", "Ctrl+Alt+Left"],
      ["jump-right", "Jump Right", "Ctrl+Alt+Right"],
      "-",
      ["cintel-scanner", "Cintel Scanner", "", "›"]
    ]},

    "workspace-menu": { label: "Workspace", verified: true, items: [
      ["switch-to-page", "Switch to Page", "", "›"],
      ["show-page", "Show Page", "", "›"],
      ["show-page-navigation", "Show Page Navigation", "✓"],
      ["show-panel-in-workspace", "Show Panel in Workspace", "", "›"],
      ["active-panel-selection", "Active Panel Selection", "", "›"],
      ["media-pool-windows", "Media Pool Windows", "", "›"],
      "-",
      ["dual-screen", "Dual Screen", "", "›"],
      "-",
      ["viewer-mode-workspace", "Viewer Mode", "", "›"],
      ["fairlight-viewer", "Fairlight Viewer", "", "›"],
      ["single-viewer-mode", "Single Viewer Mode", "✓"],
      "-",
      ["full-screen-window", "Full Screen Window"],
      "-",
      ["layout-presets", "Layout Presets", "", "›"],
      ["reset-ui-layout", "Reset UI Layout"],
      "-",
      ["data-burn-in", "Data Burn-In"],
      ["gallery", "Gallery"],
      ["keyword-manager", "Keyword Manager…"],
      ["manage-faces", "Manage Faces"],
      ["scene-cut-detection", "Scene Cut Detector…"],
      ["timecode-window", "Timecode Window"],
      ["scopes", "Video Scopes", "", "›"],
      "-",
      ["remote-grading", "Remote Grading…", "Ctrl+G"],
      ["remote-monitoring", "Remote Monitoring"],
      ["remote-rendering", "Remote Rendering"],
      "-",
      ["monitor-calibration", "Monitor Calibration", "", "›"],
      "-",
      ["console", "Console", "F6"],
      ["scripting", "Scripts", "", "›"],
      "-",
      ["workflow-integrations", "Workflow Integrations", "", "›"]
    ]},

    "help-menu": { label: "Help", verified: true, items: [
      ["help-search", "🔍 Search"],
      "-",
      ["davinci-resolve-reference-manual", "DaVinci Resolve Reference Manual"],
      ["davinci-resolve-training", "DaVinci Resolve Training"],
      "-",
      ["davinci-control-panels-setup", "DaVinci Control Panels Setup"],
      ["welcome-to-davinci-resolve", "Welcome to DaVinci Resolve"],
      ["davinci-resolve-reference-manual", "Documentation", "", "›"],
      ["create-diagnostics-log-on-desktop", "Create Diagnostics Log on Desktop"],
      "-",
      ["deactivate-license", "Deactivate License"]
    ]},

    /* Мөрийн 5 дахь утга "clip" — тухайн команд timeline дээрх клип дээр
       ажилладаг гэсэн үг. Монтаж хийдэггүй хуудсанд (Fusion, Media, Color…)
       саарал болж идэвхгүй болно. Хэрэглэгчийн Fusion хуудсан дээрх дэлгэцээс
       баталсан: 36 мөрөөс зөвхөн 8 нь идэвхтэй байв — Undo, Redo, Cut, Copy,
       Paste, Delete Selected, Select All, Deselect All. Эдгээр нь Fusion-д
       нодон дээр ажилладаг тул идэвхтэй хэвээр. */
    /* Edit цэс — мөр бүрийн 5 дахь утга нь тухайн команд ИДЭВХТЭЙ байх хуудсууд.
       Fusion, Color, Fairlight, Photo, Deliver хуудсан дээр цэсийг нээсэн 2026-09-19-ний
       дэлгэцийн зургаас (Photo: Paste Attributes, Insert идэвхтэй; Deliver: Delete Selected,
       Ripple Delete идэвхтэй); Edit, Cut хуудсанд клип сонгосон үед бүгд идэвхтэй гэж үзэв.
       Media хуудсанд зургаар баталгаажаагүй. */
    "edit-menu": { label: "Edit", verified: true, items: [
      ["undo", "Undo", "Ctrl+Z"],
      ["redo", "Redo", "Ctrl+Shift+Z"],
      ["history", "History", "", "›", "edit,cut,fusion,fairlight,media,photo,deliver"],
      "-",
      ["cut-clipboard", "Cut", "Ctrl+X", "", "edit,cut,fairlight"],
      ["ripple-cut", "Ripple Cut", "Ctrl+Shift+X", "", "edit,cut,fairlight"],
      ["cut-head", "Cut Head", "", "", "edit,cut,fairlight"],
      ["cut-tail", "Cut Tail", "", "", "edit,cut,fairlight"],
      ["copy", "Copy", "Ctrl+C", "", "edit,cut,color,fairlight"],
      ["copy-head", "Copy Head", "", "", "edit,cut,fairlight"],
      ["copy-tail", "Copy Tail", "", "", "edit,cut,fairlight"],
      ["paste", "Paste", "Ctrl+V", "", "edit,cut,color,fairlight"],
      ["paste-insert", "Paste Insert", "Ctrl+Shift+V", "", "edit,cut,fairlight"],
      ["paste-attributes", "Paste Attributes…", "Alt+V", "", "edit,cut,color,fairlight,photo"],
      ["paste-value", "Paste Value", "Alt+Shift+V", "", "edit,cut,color"],
      ["remove-attributes", "Remove Attributes…", "", "", "edit,cut,fairlight"],
      ["dolby-vision", "Dolby Vision®", "", "›", "edit,color"],
      "-",
      ["duplicate-clip", "Duplicate Clip", "", "", "edit,cut"],
      ["duplicate-selection", "Duplicate Selection", "", "", "edit,cut,fairlight"],
      "-",
      ["lift-delete", "Delete Selected", "Backspace", "", "edit,cut,color,fairlight,deliver"],
      ["ripple-delete", "Ripple Delete", "Shift+Backspace", "", "edit,cut,color,fairlight,deliver"],
      ["delete-gaps", "Delete Gaps", "", "", "edit,cut"],
      "-",
      ["select-all", "Select All", "Ctrl+A"],
      ["deselect-all", "Deselect All", "Ctrl+Shift+A"],
      ["auto-select", "Select", "", "›", "edit,cut"],
      "-",
      ["insert", "Insert", "F9", "", "edit,cut,photo"],
      ["overwrite", "Overwrite", "F10", "", "edit,cut"],
      ["replace", "Replace", "F11", "", "edit,cut"],
      ["place-on-top", "Place on Top", "F12", "", "edit,cut"],
      ["ripple-overwrite", "Ripple Overwrite", "Shift+F10", "", "edit,cut"],
      ["fit-to-fill", "Fit to Fill", "Shift+F11", "", "edit,cut"],
      ["append-to-end", "Append to End of Timeline", "Shift+F12", "", "edit,cut"],
      "-",
      ["multicam-clip", "Multicam", "", "›", "edit,cut"],
      "-",
      ["insert-gap", "Insert Gap", "", "", "edit,cut"],
      ["swap-clips-towards-left", "Swap Clips Towards Left", "Ctrl+Shift+,", "", "edit,cut"],
      ["swap-clips-towards-right", "Swap Clips Towards Right", "Ctrl+Shift+.", "", "edit,cut"],
      "-",
      ["edit-options", "Edit Options", "", "›", "edit,cut"]
    ]},

    /* Color → Effects → Library таб: Resolve FX Blur бүлэг — 2026-09-19-ний зургаас */
    "resolve-fx-blur": { label: "Library — Resolve FX Blur", verified: true, items: [
      ["box-blur", "Box Blur"],
      ["cinefocus", "CineFocus"],
      ["directional-blur", "Directional Blur"],
      ["gaussian-blur", "Gaussian Blur"],
      ["lens-blur", "Lens Blur"],
      ["mosaic-blur", "Mosaic Blur"]
    ]},

    /* Photo хуудасны хэрэгслийн мөрийн "Photo Album ⌄" — 2026-09-19-ний зургаас */
    "photo-album-menu": { label: "Photo Album", verified: true, items: [
      ["sort-by-photo", "Sort by", "", "›"],
      "-",
      ["all-photos", "✓ All Photos"],
      ["selected-photos", "Selected Photos"],
      "-",
      ["graded-photos", "Graded Photos"],
      ["ungraded-photos", "Ungraded Photos"],
      ["modified-photos", "Modified Photos", "", "›"],
      "-",
      ["people-photo", "People", "", "›"],
      ["grouped-photo", "Grouped", "", "›"],
      ["hdr-graded", "HDR Graded"],
      ["magic-mask", "Magic Mask"],
      ["noise-reduction", "Noise Reduction"],
      ["openfx", "Open FX"],
      "-",
      ["source-sizing", "Source Sizing"],
      ["common-media-pool-source", "Common Media Pool Source"],
      ["photos-in-bin", "Photos in Bin", "", "", "none"],
      ["matte-nodes", "Matte Nodes"],
      ["mattes-available", "Mattes Available"],
      "-",
      ["create-smart-filter", "Create Smart Filter…"]
    ]},

    /* Cut хуудас — дээд timeline-ийн зүүн булангийн эхний товч ⚌ "Timeline Options"
       (2026-09-19-ний зураг: 18 мөр, 7 тусгаарлагч; "✓" = зурагт чагттай байсан). */
    "timeline-options": { label: "Timeline Options", verified: true, items: [
      ["ripple-on", "Ripple On"],
      "-",
      ["snap", "Snap", "✓"],
      ["trim-to-audio", "Trim to Audio"],
      ["trim-with-safe-edit", "Trim with Safe Edit"],
      "-",
      ["display-clip-names", "Display Clip Names"],
      ["display-clip-status", "Display Clip Status", "✓"],
      ["display-clip-duration", "Display Clip Duration", "✓"],
      ["display-speed-keyframes", "Display Speed Keyframes", "✓"],
      ["viewer-background", "Viewer Background", "", "›"],
      "-",
      ["set-default-transition", "Set Default Transition"],
      "-",
      ["edit-using-all-channels", "Edit Using All Channels", "✓"],
      ["edit-using-ch-1-2", "Edit Using Ch 1&2"],
      ["edit-using-ch-3-4", "Edit Using Ch 3&4"],
      ["edit-using-ch-5-6", "Edit Using Ch 5&6"],
      ["edit-using-ch-7-8", "Edit Using Ch 7&8"],
      "-",
      ["minimize-subtitle-track", "Minimize Subtitle Track"],
      "-",
      ["fixed-playhead", "Fixed Playhead", "✓"],
      "-",
      ["boring-detector", "Boring Detector"]
    ]},

    /* Cut хуудас — дээд timeline-ийн зүүн булангийн хоёр дахь товч ⇤≡ "Timeline Actions"
       (tooltip-ийг хэрэглэгч баталгаажуулсан; 2026-09-19-ний зураг: 15 мөр, 5 тусгаарлагч).
       Voice Convert саарал байсан — нөхцөл тодорхойгүй. */
    "timeline-actions": { label: "Timeline Actions", verified: true, items: [
      ["create-subtitles-from-audio", "Create Subtitles from Audio"],
      ["scene-cut-detection", "Detect Scene Cuts"],
      "-",
      ["ai-audio-assistant", "Audio Assistant"],
      ["ai-voice-convert", "Voice Convert", "", "", "none"],
      "-",
      ["add-video-track", "Add Video Track"],
      ["add-audio-track", "Add Audio Track"],
      ["add-subtitle-track", "Add Subtitle Track"],
      ["delete-empty-tracks", "Delete Empty Tracks"],
      "-",
      ["split-clip", "Split Clips"],
      ["join-match-edit-clips", "Join Match Edit Clips"],
      "-",
      ["marker", "Add Marker"],
      ["set-color-and-add-marker", "Set Color and Add Marker"],
      "-",
      ["clear-transition-from-all-edits", "Clear Transition from All Edits"],
      ["add-dissolve-to-all-edits", "Add Dissolve to All Edits"],
      ["add-transition-to-all-edits", "Add Transition to All Edits"]
    ]},

    /* Cut хуудасны Keyframes самбар — Parameters толгойн "…" товч (2026-09-19-ний зураг).
       "✓" = зурагт чагттай байсан (одоогийн горим). */
    "keyframe-parameters-menu": { label: "Parameters …", verified: true, items: [
      ["display-parameters-with-keyframes", "Display Parameters with Keyframes", "✓"],
      ["display-all-parameters", "Display All Parameters"],
      ["display-selected-parameters", "Display Selected Parameters", "", "›"],
      "-",
      ["expand-all-parameters", "Expand All Parameters"],
      ["collapse-all-parameters", "Collapse All Parameters"],
      "-",
      ["reset-keyframe-ui", "Reset Keyframe UI"]
    ]},

    /* Keyframes самбарын баруун дээд "…" товч (2026-09-19-ний зураг). */
    "keyframe-timeline-menu": { label: "Keyframe timeline …", verified: true, items: [
      ["enables-snapping", "Enables Snapping", "✓"],
      ["loop-type", "Loop Type", "", "›"],
      ["legacy-speed-mode", "Legacy Speed Mode"]
    ]},

    /* Cut хуудас — дээд timeline-ийн зүүн булангийн 3 дахь товч (tooltip нэр баталгаажаагүй). */
    "trim-resync-menu-cut": { label: "Trim / Resync", verified: true, items: [
      ["trim-start", "Trim Start to Playhead"],
      ["trim-end", "Trim End to Playhead"],
      "-",
      ["resync-clip", "Resync Clip"]
    ]},

    "color-page": { label: "Color", verified: true, items: [
      ["node-editor", "Nodes", "", "›"],
      ["reset", "Reset", "", "›"],
      ["grade-version", "Grade Version", "", "›"],
      "-",
      ["still", "Stills", "", "›"],
      ["apply-grade", "Apply Grade"],
      ["apply-active-layer", "Apply Active Layer"],
      ["append-node-graph", "Append Node Graph"],
      ["step-timeline-wipe", "Step Timeline Wipe", "", "›"],
      "-",
      ["preview-memory", "Preview Memory", "Alt+Shift+P"],
      ["original-memory", "Original Memory", "Alt+Shift+O"],
      ["memories", "Memories", "", "›"],
      ["apply-grade-from-one-clip-prior", "Apply Grade from One Clip Prior", "Shift+="],
      ["apply-grade-from-two-clips-prior", "Apply Grade from Two Clips Prior", "Shift+-"],
      ["gallery", "Presets", "", "›"],
      "-",
      ["ripple-node-changes-to-selected-clips", "Ripple Node Changes to Selected Clips"],
      ["ripple-grade", "Ripple Node Changes to Current Group"],
      ["append-node-to-selected-clips", "Append Node to Selected Clips"],
      "-",
      ["auto-color", "Auto Color", "Alt+Shift+C"],
      "-",
      ["active-playhead", "Active Playhead", "", "›"],
      ["window-tracker", "Tracker", "", "›"],
      ["resolve-live", "Resolve Live", "", "›"],
      "-",
      ["printer-light", "Printer Light Hotkeys", "Ctrl+Alt+`"],
      ["printer-light", "Full Printer Light", "", "›"],
      ["printer-light", "Half Printer Light", "", "›"],
      ["printer-light", "Quarter Printer Light", "", "›"],
      "-",
      ["multimaster-trim-manager", "MultiMaster Trim Manager…"],
      "-",
      ["dolby-vision", "Dolby Vision®", "", "›"],
      ["hdr10-plus", "HDR10+", "", "›"],
      ["hdr-vivid", "HDR Vivid", "", "›"],
      "-",
      ["amf", "Automatically Link AMF for", "", "›"]
    ]},

    "fairlight-page": { label: "Fairlight", verified: true, items: [
      ["bus-format", "Bus Format…"],
      ["bus-assign", "Bus Assign…"],
      ["presets-library", "Presets Library…"],
      ["link-group", "Link Group…"],
      ["vca-assign", "VCA Assign…"],
      ["patch-input-output", "Patch Input/Output…"],
      "-",
      ["test-tones", "Test Tones Settings…"],
      ["synchronization-settings", "Synchronization Settings…"],
      "-",
      ["input-monitor-style", "Input Monitor Style", "", "›"],
      ["monitoring", "Monitoring", "", "›"],
      ["exclusive-solo", "Exclusive Solo"],
      ["immersive-audio", "Immersive Audio", "", "›"],
      ["automation", "Automation", "", "›"],
      "-",
      ["batch-fade", "Batch Fade Settings…"],
      ["batch-fade", "Apply Batch Fades"],
      "-",
      ["view-clip-info-display", "View Clip Info Display…"],
      ["show-clip-gain-line", "Show Clip Gain Line", "✓"]
    ]},

    /* ═══ Edit хуудас (2026-09-26-ны зургууд) ═══
       Viewer-ийн доод зүүн ▭ ⌄ — дэлгэц дээрх удирдлагын горим (8 мөр, тусгаарлагчгүй). */
    "viewer-overlay-menu-edit": { label: "Viewer Overlay Menu (Edit)", verified: true, items: [
      ["transform", "Transform"],
      ["crop", "Crop"],
      ["dynamic-zoom", "Dynamic Zoom"],
      ["open-fx-overlay", "Open FX Overlay"],
      ["fusion-overlay", "Fusion Overlay"],
      ["annotations", "Annotations"],
      ["immersive-viewer", "Immersive"],
      ["smart-reframe", "Smart Reframe"]
    ]},

    /* Timeline хэрэгслийн мөрийн хамгийн зүүн ⚌ — Timeline View Options.
       ✓ — зурагт чагттай. "head", "slider:NN", "button" — цэсний тусгай мөр (60-sim-ui.js). */
    "timeline-view-options": { label: "Timeline View Options", verified: true, items: [
      ["display-stacked-timelines", "Display Stacked Timelines"],
      ["display-subtitle-tracks", "Display Subtitle Tracks", "✓"],
      ["display-audio-waveforms", "Display Audio Waveforms", "✓"],
      ["display-clip-names", "Display Clip Names", "✓"],
      ["display-clip-duration", "Display Clip Durations", "✓"],
      "-",
      ["thumbnail-view-timeline", "Thumbnail View", "", "›"],
      ["viewer-background", "Viewer Background", "", "›"],
      "-",
      ["fixed-playhead", "Fixed Playhead"],
      "-",
      ["display-non-rectified-waveforms", "Display Non-Rectified Waveforms", "✓"],
      ["display-full-waveforms", "Display Full Waveforms"],
      ["display-waveform-borders", "Display Waveform Borders"],
      ["display-scaled-waveforms", "Display Scaled Waveforms"],
      "-",
      ["track-height", "Track Height", "head"],
      ["track-height", "Video", "slider:46"],
      ["track-height", "Audio", "slider:38"],
      ["set-as-default-view", "Set as Default View", "button"]
    ]},

    /* Туг ⌄ — Clear All + 16 өнгө (дөрвөлжин туг) */
    "flag-color-menu": { label: "Flag Color Menu", verified: true, items: [
      ["clear-all-flags", "Clear All", "×"],
      ["flag-color", "Blue", "sw:sq:#2f7ff5"],
      ["flag-color", "Cyan", "sw:sq:#27cfd8"],
      ["flag-color", "Green", "sw:sq:#2fc24a"],
      ["flag-color", "Yellow", "sw:sq:#f0a232"],
      ["flag-color", "Red", "sw:sq:#e8392f"],
      ["flag-color", "Pink", "sw:sq:#f040b8"],
      ["flag-color", "Purple", "sw:sq:#9a3cf0"],
      ["flag-color", "Fuchsia", "sw:sq:#e2346c"],
      ["flag-color", "Rose", "sw:sq:#f39ab8"],
      ["flag-color", "Lavender", "sw:sq:#a79cf0"],
      ["flag-color", "Sky", "sw:sq:#8fd6f4"],
      ["flag-color", "Mint", "sw:sq:#72d46a"],
      ["flag-color", "Lemon", "sw:sq:#e6e45a"],
      ["flag-color", "Sand", "sw:sq:#e8a66c"],
      ["flag-color", "Cocoa", "sw:sq:#9a6b52"],
      ["flag-color", "Cream", "sw:sq:#f4efe4"]
    ]},

    /* Marker ⌄ — Clear All + 16 өнгө (дугуй цэг) */
    "marker-color-menu": { label: "Marker Color Menu", verified: true, items: [
      ["clear-all-markers", "Clear All", "×"],
      ["marker-color", "Blue", "sw:dot:#2f7ff5"],
      ["marker-color", "Cyan", "sw:dot:#27cfd8"],
      ["marker-color", "Green", "sw:dot:#2fc24a"],
      ["marker-color", "Yellow", "sw:dot:#f0a232"],
      ["marker-color", "Red", "sw:dot:#e8392f"],
      ["marker-color", "Pink", "sw:dot:#f040b8"],
      ["marker-color", "Purple", "sw:dot:#9a3cf0"],
      ["marker-color", "Fuchsia", "sw:dot:#e2346c"],
      ["marker-color", "Rose", "sw:dot:#f39ab8"],
      ["marker-color", "Lavender", "sw:dot:#a79cf0"],
      ["marker-color", "Sky", "sw:dot:#8fd6f4"],
      ["marker-color", "Mint", "sw:dot:#72d46a"],
      ["marker-color", "Lemon", "sw:dot:#e6e45a"],
      ["marker-color", "Sand", "sw:dot:#e8a66c"],
      ["marker-color", "Cocoa", "sw:dot:#9a6b52"],
      ["marker-color", "Cream", "sw:dot:#f4efe4"]
    ]},

    /* Media Pool-ийн дээд мөр — AI шинжилгээний ⌄ (3 мөр) */
    "ai-analysis-menu-media-pool": { label: "AI Analysis Menu (Media Pool)", verified: true, items: [
      ["perform-ai-analysis-in-all-clips", "Perform AI Analysis in all Clips", "✓"],
      ["perform-ai-analysis-in-selected-clips", "Perform AI Analysis in Selected Clips"],
      "-",
      ["audio-transcription", "Audio Transcription", "", "", "none"]
    ]},

    /* Media Pool-ийн харагдац ▦ ⌄ — 3 мөр + зургийн хэмжээний гүйлгэгч */
    "media-pool-view-menu": { label: "Media Pool View Menu", verified: true, items: [
      ["metadata-view", "Metadata View"],
      ["thumbnail-view", "Thumbnail View", "✓"],
      ["list-view", "List View"],
      "-",
      ["thumbnail-view", "Size", "slider:3"]
    ]},

    /* Media Pool-ийн эрэмбэлэх ⇅ — Custom, 19 талбар, чиглэл, Custom-ийн туслах (саарал) */
    "media-pool-sort-menu": { label: "Media Pool Sort Menu", verified: true, items: [
      ["media-pool-sort-menu", "Custom"],
      "-",
      ["media-pool-sort-menu", "File Name"],
      ["reel-name", "Reel Name"],
      ["media-pool-sort-menu", "Clip Name", "✓"],
      ["media-pool-sort-menu", "Start TC"],
      ["media-pool-sort-menu", "Duration"],
      ["media-pool-sort-menu", "Type"],
      ["media-pool-sort-menu", "FPS"],
      ["media-pool-sort-menu", "Audio Ch"],
      ["flag", "Flags"],
      ["media-pool-sort-menu", "Date Modified"],
      ["media-pool-sort-menu", "Date Created"],
      ["media-pool-sort-menu", "Date Added"],
      ["media-pool-sort-menu", "Shot"],
      ["media-pool-sort-menu", "Scene"],
      ["media-pool-sort-menu", "Take"],
      ["camera", "Camera #"],
      ["clip-color", "Clip Color"],
      ["media-pool-sort-menu", "File Path"],
      ["online-status", "Online Status"],
      "-",
      ["ascending-descending", "Ascending", "✓"],
      ["ascending-descending", "Descending"],
      "-",
      ["snap-to-grid", "Snap To Grid", "✓", "", "none"],
      "-",
      ["clean-up", "Clean Up", "", "", "none"]
    ]},

    /* Media Pool-ийн … — 13 мөр, 7 бүлэг */
    "media-pool-options-menu": { label: "Media Pool Options Menu", verified: true, items: [
      ["intellisearch-mode", "IntelliSearch Mode", "", "›"],
      ["reset-intellisearch-analysis", "Reset IntelliSearch Analysis…"],
      "-",
      ["show-filmstrip", "Show Filmstrip", "", "", "none"],
      "-",
      ["show-audio-waveforms-media-pool", "Show Audio Waveforms", "✓"],
      ["show-non-rectified-audio-waveforms", "Show Non-Rectified Audio Waveforms", "✓"],
      "-",
      ["show-import-log", "Show Import Log"],
      ["show-export-log", "Show Export Log"],
      "-",
      ["show-smart-bins", "Show Smart Bins", "✓"],
      ["show-power-bins", "Show Power Bins"],
      "-",
      ["update-usage-for-entire-project", "Update Usage for Entire Project…"],
      ["remove-unused-clips", "Remove Unused Clips…"],
      "-",
      ["export-as-pdf", "Export as PDF…"],
      "-",
      ["deleted-timeline-backups", "Deleted Timeline Backups…"]
    ]},

    /* Viewer-ийн толгой — прокси ⌄ (3 мөр) */
    "proxy-menu-viewer": { label: "Proxy Menu (Viewer)", verified: true, items: [
      ["proxy-handling", "Disable All Proxies"],
      ["proxy-handling", "Prefer Proxies"],
      ["proxy-handling", "Prefer Camera Originals", "✓"]
    ]},

    /* Viewer-ийн толгой — timeline-ийн нягтрал ⌄ */
    "timeline-resolution-menu-viewer": { label: "Timeline Resolution Menu (Viewer)", verified: true, items: [
      ["uhd", "Ultra HD 3840 x 2160", "✓"],
      ["full-hd", "Full HD 1920 x 1080"],
      ["portrait-1080-x-1920", "Portrait 1080 x 1920"],
      ["square-1080-x-1080", "Square 1080 x 1080"],
      "-",
      ["custom-timeline-settings", "Custom Timeline Settings"]
    ]},

    /* Viewer-ийн толгой — … (9 мөр) */
    "viewer-options-menu-edit": { label: "Viewer Options Menu (Edit)", verified: true, items: [
      ["gang-viewers", "Gang Viewers"],
      ["show-all-video-frames", "Show All Video Frames"],
      ["show-timecode-toolbar", "Show Timecode Toolbar"],
      "-",
      ["previous-timeline-next-timeline", "Previous Timeline"],
      ["previous-timeline-next-timeline", "Next Timeline"],
      "-",
      ["show-marker-overlays", "Show Marker Overlays", "✓"],
      ["show-timecode-overlays", "Show Timecode Overlays"],
      ["show-overlays-during-playback", "Show Overlays During Playback"],
      "-",
      ["marker", "Markers", "", "›"]
    ]},

    /* Color viewer — Split Screen асаалттай үед 2 дахь мөрийн «Version ⌄» (11 мөр, 2026-09-26) */
    "split-screen-mode-menu": { label: "Split Screen Mode Menu", verified: true, items: [
      ["split-screen-mode-menu", "Current Group"],
      ["split-screen-mode-menu", "Highlight Modes"],
      ["split-screen-mode-menu", "Neighbor Clips"],
      ["split-screen-mode-menu", "Playheads"],
      ["split-screen-mode-menu", "Selected Album"],
      ["split-screen-mode-menu", "Selected Clips"],
      ["split-screen-mode-menu", "Selected LUTs"],
      ["split-screen-mode-menu", "Selected Still Grades"],
      ["split-screen-mode-menu", "Selected Still Images"],
      ["split-screen-mode-menu", "Version", "✓"],
      ["split-screen-mode-menu", "Versions and Original"]
    ]},

    /* Color → Tracker самбарын ⌄ — мөрдөх арга (3 мөр, 2026-09-26) */
    "tracker-method-menu": { label: "Tracker Method Menu", verified: true, items: [
      ["cloud-tracker", "Cloud Tracker", "✓"],
      ["point-tracker", "Point Tracker"],
      ["intellitrack", "AI IntelliTrack"]
    ]},

    /* Color → Tracker самбарын … (FX горимд, 2026-09-26) */
    "tracker-options-menu": { label: "Tracker Options Menu", verified: true, items: [
      ["reset-track-data-on-active-window", "Reset Track Data on Active Window"],
      ["clear-selected-track-data", "Clear Selected Track Data"],
      ["delete-keyframe", "Delete Keyframe"],
      ["clear-all-tracking-points", "Clear All Tracking Points"],
      "-",
      ["show-track", "Show Track"],
      "-",
      ["copy-track-data-paste-track-data", "Copy Track Data"],
      ["copy-track-data-paste-track-data", "Paste Track Data"],
      "-",
      ["classic-stabilizer", "Classic Stabilizer", "", "", "none"],
      ["use-gpu-acceleration-tracker", "Use GPU Acceleration", "✓", "", "none"]
    ]},

    /* Color → Keyframes самбарын All ⌄ (3 мөр) */
    "keyframes-filter-color": { label: "Keyframes Filter (Color)", verified: true, items: [
      ["keyframes-filter-color", "All", "✓"],
      ["keyframes-filter-color", "Color"],
      ["sizing-keyframes", "Sizing"]
    ]},

    /* Color → Nodes самбарын толгой: ↖ ⌄ ба нод нэмэх ⌄ (2026-09-26) */
    "node-editor-pointer-menu": { label: "Node Editor Pointer Menu", verified: true, items: [
      ["selection-mode-node-editor", "Selection Mode"],
      ["hand-mode-node-editor", "Hand Mode"]
    ]},
    "add-node-menu": { label: "Add Node Menu", verified: true, items: [
      ["serial-node", "Add Serial"],
      ["parallel-node", "Add Parallel"],
      ["layer-node", "Add Layer"]
    ]},

    /* Color viewer-ийн … (20 мөр, 2026-09-26) */
    "viewer-options-menu-color": { label: "Viewer Options Menu (Color)", verified: true, items: [
      ["highlight", "Highlight", "", "›"],
      ["show-rgb-picker-values-in", "Show RGB Picker Values In", "", "›"],
      ["show-viewer-channels", "Show Viewer Channels", "", "›"],
      "-",
      ["split-screen", "Split Screen", "", "›"],
      "-",
      ["timeline-sort-order", "Timeline Sort Order", "", "›"],
      ["previous-timeline-next-timeline", "Previous Timeline"],
      ["previous-timeline-next-timeline", "Next Timeline"],
      "-",
      ["show-viewer-options", "Show Viewer Options", "✓"],
      ["show-marker-overlays", "Show Marker Overlays", "✓"],
      ["window-outline", "Window Outline", "", "›"],
      ["video-output-options", "Video Output Options", "", "›"],
      "-",
      ["marker", "Markers", "", "›"],
      "-",
      ["show-reference-wipe", "Show Reference Wipe", "Ctrl+W"],
      ["reference-wipe-mode", "Reference Wipe mode", "", "›"],
      ["wipe-style-toolbar-color-viewer", "Wipe Style", "", "›"],
      ["invert-wipe", "Invert Wipe", "Alt+W"],
      ["reference-reposition", "Reference Reposition", "Alt+Shift+R"],
      "-",
      ["gang-timeline-wipe-with-current-clip", "Gang Timeline Wipe With Current Clip"]
    ]},

    /* Color → Nodes: харагдац ⌄ ба … (2026-09-26) */
    "node-view-menu": { label: "Node View Menu", verified: true, items: [
      ["graph-view-list-view-nodes", "Graph View", "✓"],
      ["graph-view-list-view-nodes", "List View"],
      "-",
      ["node-view-menu", "Size", "slider:6"]
    ]},
    "node-editor-options-menu": { label: "Node Editor Options Menu", verified: true, items: [
      ["switching-clips-selects", "Switching Clips Selects", "", "›"],
      ["show-thumbnails-nodes", "Show Thumbnails", "✓"],
      ["disable-thumbnail-refresh-during-playback", "Disable Thumbnail Refresh during Playback"],
      "-",
      ["track-node-changes-using-color", "Track Node Changes Using Color", "", "›"],
      ["reset-all-node-colors", "Reset all node colors"],
      "-",
      ["display-node-stack-navigation", "Display Node Stack Navigation", "✓"],
      "-",
      ["reset-all-grades-and-nodes", "Reset All Grades and Nodes"],
      ["reset-all-node-stack-layers", "Reset All Node Stack Layers"]
    ]},

    /* Color → Effects (Library / Settings) … */
    "effects-options-menu-color": { label: "Effects Options Menu (Color)", verified: true, items: [
      ["show-all-favorites-effects", "Show All", "✓"],
      ["show-all-favorites-effects", "Favorites"],
      "-",
      ["show-legacy-resolve-fx", "Show Legacy Resolve FX"]
    ]}
  };

})(window.RM);
