/* ═════════════════════════════════════════════════════════════
   52 · Цэсний агуулга

   Edit, Color, Fairlight гурвыг хэрэглэгчийн бодит DaVinci Resolve
   Studio 21-ийн дэлгэцээс уншиж баталсан — дараалал, тусгаарлагч,
   товчлуур, дэд цэсний сум бүгд тэндээс авсан.

   Бусад цэсийг хараахан баталгаажуулаагүй тул зохиомол агуулга бичээгүй.

   Мөрийн бүтэц:  [толины id, харагдах нэр, товчлуур?, "›" бол дэд цэстэй]
   "-" гэсэн мөр нь тусгаарлах зураас.
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  RM.sim.menus = {

    "edit-menu": { label: "Edit", verified: true, items: [
      ["undo", "Undo", "Ctrl+Z"],
      ["redo", "Redo", "Ctrl+Shift+Z"],
      ["history", "History", "", "›"],
      "-",
      ["cut-clipboard", "Cut", "Ctrl+X"],
      ["ripple-cut", "Ripple Cut", "Ctrl+Shift+X"],
      ["cut-head", "Cut Head"],
      ["cut-tail", "Cut Tail"],
      ["copy", "Copy", "Ctrl+C"],
      ["copy-head", "Copy Head"],
      ["copy-tail", "Copy Tail"],
      ["paste", "Paste", "Ctrl+V"],
      ["paste-insert", "Paste Insert", "Ctrl+Shift+V"],
      ["paste-attributes", "Paste Attributes…", "Alt+V"],
      ["paste-value", "Paste Value", "Alt+Shift+V"],
      ["remove-attributes", "Remove Attributes…"],
      ["dolby-vision", "Dolby Vision®", "", "›"],
      "-",
      ["duplicate-clip", "Duplicate Clip"],
      ["duplicate-selection", "Duplicate Selection"],
      "-",
      ["lift-delete", "Delete Selected", "Backspace"],
      ["ripple-delete", "Ripple Delete", "Shift+Backspace"],
      ["delete-gaps", "Delete Gaps"],
      "-",
      ["select-all", "Select All", "Ctrl+A"],
      ["deselect-all", "Deselect All", "Ctrl+Shift+A"],
      ["auto-select", "Select", "", "›"],
      "-",
      ["insert", "Insert", "F9"],
      ["overwrite", "Overwrite", "F10"],
      ["replace", "Replace", "F11"],
      ["place-on-top", "Place on Top", "F12"],
      ["ripple-overwrite", "Ripple Overwrite", "Shift+F10"],
      ["fit-to-fill", "Fit to Fill", "Shift+F11"],
      ["append-to-end", "Append to End of Timeline", "Shift+F12"],
      "-",
      ["multicam-clip", "Multicam", "", "›"],
      "-",
      ["insert-gap", "Insert Gap"],
      ["swap-clips-towards-left", "Swap Clips Towards Left", "Ctrl+Shift+,"],
      ["swap-clips-towards-right", "Swap Clips Towards Right", "Ctrl+Shift+."],
      "-",
      ["edit-options", "Edit Options", "", "›"]
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
    ]}
  };

})(window.RM);
