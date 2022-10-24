// define a custom grid layout that makes sure the length of each lane is the same
// and that each lane is broad enough to hold its subgraph
class PoolLayout extends go.GridLayout {
    constructor() {
        super();
        this.MINLENGTH = 300;  // this controls the minimum length of any swimlane
        this.MINBREADTH = 100;  // this controls the minimum breadth of any non-collapsed swimlane
        this.cellSize = new go.Size(1, 1);
        this.wrappingColumn = Infinity;
        this.wrappingWidth = Infinity;
        this.spacing = new go.Size(0, 0);
        this.alignment = go.GridLayout.Position;
    }

    doLayout(coll) {
        const diagram = this.diagram;
        if (diagram === null) return;
        diagram.startTransaction("PoolLayout");
        // make sure all of the Group Shapes are big enough
        const minlen = this.computeMinPoolLength();
        diagram.findTopLevelGroups().each(lane => {
            if (!(lane instanceof go.Group)) return;
            const shape = lane.selectionObject;
            if (shape !== null) {  // change the desiredSize to be big enough in both directions
                const sz = this.computeLaneSize(lane);
                shape.width = (!isNaN(shape.width)) ? Math.max(shape.width, sz.width) : sz.width;
                // if you want the height of all of the lanes to shrink as the maximum needed height decreases:
                shape.height = minlen;
                // if you want the height of all of the lanes to remain at the maximum height ever needed:
                //shape.height = (isNaN(shape.height) ? minlen : Math.max(shape.height, minlen));
                const cell = lane.resizeCellSize;
                if (!isNaN(shape.width) && !isNaN(cell.width) && cell.width > 0) shape.width = Math.ceil(shape.width / cell.width) * cell.width;
                if (!isNaN(shape.height) && !isNaN(cell.height) && cell.height > 0) shape.height = Math.ceil(shape.height / cell.height) * cell.height;
            }
        });
        // now do all of the usual stuff, according to whatever properties have been set on this GridLayout
        super.doLayout(coll);
        diagram.commitTransaction("PoolLayout");
    };

    // compute the minimum length of the whole diagram needed to hold all of the Lane Groups
    computeMinPoolLength() {
        let len = this.MINLENGTH;
        myDiagram.findTopLevelGroups().each(lane => {
            const holder = lane.placeholder;
            if (holder !== null) {
                const sz = holder.actualBounds;
                len = Math.max(len, sz.height);
            }
        });
        return len;
    }

    // compute the minimum size for a particular Lane Group
    computeLaneSize(lane) {
        // assert(lane instanceof go.Group);
        const sz = new go.Size(lane.isSubGraphExpanded ? this.MINBREADTH : 1, this.MINLENGTH);
        if (lane.isSubGraphExpanded) {
        const holder = lane.placeholder;
            if (holder !== null) {
                const hsz = holder.actualBounds;
                sz.width = Math.max(sz.width, hsz.width);
            }
        }
        // minimum breadth needs to be big enough to hold the header
        const hdr = lane.findObject("HEADER");
        if (hdr !== null) sz.width = Math.max(sz.width, hdr.actualBounds.width);
        return sz;
    }
}
// end PoolLayout class


function init() {

    // Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
    // For details, see https://gojs.net/latest/intro/buildingObjects.html
    const $ = go.GraphObject.make;

    myDiagram =
    $(go.Diagram, "myDiagramDiv",
        {
        // make sure the top-left corner of the viewport is occupied
        contentAlignment: go.Spot.TopLeft,
        // use a simple layout to stack the top-level Groups next to each other
        layout: $(PoolLayout),
        // disallow nodes to be dragged to the diagram's background
        mouseDrop: e => {
            e.diagram.currentTool.doCancel();
        },
        // a clipboard copied node is pasted into the original node's group (i.e. lane).
        "commandHandler.copiesGroupKey": true,
        // automatically re-layout the swim lanes after dragging the selection
        "SelectionMoved": relayoutDiagram,  // this DiagramEvent listener is
        "SelectionCopied": relayoutDiagram, // defined above
        "undoManager.isEnabled": true,
        // allow TextEditingTool to start without selecting first
        "textEditingTool.starting": go.TextEditingTool.SingleClick
        });

    // Customize the dragging tool:
    // When dragging a node set its opacity to 0.6 and move it to be in front of other nodes
    myDiagram.toolManager.draggingTool.doActivate = function() {
        go.DraggingTool.prototype.doActivate.call(this);
        this.currentPart.opacity = 0.6;
        this.currentPart.layerName = "Foreground";
    }
    myDiagram.toolManager.draggingTool.doDeactivate = function() {
        this.currentPart.opacity = 1;
        this.currentPart.layerName = "";
        go.DraggingTool.prototype.doDeactivate.call(this);
    }

    // this is called after nodes have been moved
    function relayoutDiagram() {
        myDiagram.selection.each(n => n.invalidateLayout());
        myDiagram.layoutDiagram();
    }

    // There are only three note colors by default, blue, red, and yellow but you could add more here:
    // NOTED: Left Edge Border color for each task
    const noteColors = ['#009CCC', '#CC293D', '#FFD700'];
    // const noteBGColors = ['#44DFFF', '#FF5C6F', '#FFF922'];
    const noteBGColors = ['#EEEEFF', '#FFEEEE', '#FFF9EE'];
    function getNoteColor(num) {
        return noteColors[Math.min(num, noteColors.length - 1)];
    }
    function getNoteFill(num) {
        return noteBGColors[Math.min(num, noteBGColors.length - 1)];
    }


    myDiagram.nodeTemplate =
    $(go.Node, "Horizontal",
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        // NOTED: This cycles the colored rectangle along the left side of each task when clicked
        // $(go.Shape, "Rectangle", {
        //     fill: '#009CCC', strokeWidth: 1, stroke: '#009CCC',
        //     width: 6, stretch: go.GraphObject.Vertical, alignment: go.Spot.Left,
        //     // if a user clicks the colored portion of a node, cycle through colors
        //     click: (e, obj) => {
        //         myDiagram.startTransaction("Update node color");
        //         let newColor = parseInt(obj.part.data.color) + 1;
        //         if (newColor > noteColors.length - 1) newColor = 0;
        //         myDiagram.model.setDataProperty(obj.part.data, "color", newColor);
        //         myDiagram.commitTransaction("Update node color");
        //     }
        // }
        // // ,
        // // new go.Binding("fill", "color", getNoteColor),
        // // new go.Binding("stroke", "color", getNoteColor)
        // ),
        $(go.Panel, "Auto",
            // NOTED: Below - Rectangle is squared, RoundedRectangle is rounded
            $(go.Shape, "RoundedRectangle", { fill: "white", stroke: "#CCCCCC",  
                // ADDED: Below - Trying to change the color of the Task
                click: (e, obj) => {
                    myDiagram.startTransaction("Update node color");
                    let newColor = parseInt(obj.part.data.color) + 1;
                    if (newColor > noteColors.length - 1) newColor = 0;
                    myDiagram.model.setDataProperty(obj.part.data, "color", newColor);
                    console.clear();
                    console.log(myDiagram.model);
                    console.log(obj.part);
                    console.log(obj.part.data);
                    myDiagram.commitTransaction("Update node color");
                }
            },
            new go.Binding("fill", "color", getNoteFill),
            new go.Binding("stroke", "color", getNoteColor)
            ),
            $(go.Panel, "Table",
                { width: 130, minSize: new go.Size(NaN, 50) },
                $(go.TextBlock,
                    // NOTED: Below is the task card
                {
                    name: 'TEXT',
                    margin: 6, font: '11px Lato, sans-serif', editable: true,
                    stroke: "#333", maxSize: new go.Size(130, NaN),
                    alignment: go.Spot.TopLeft
                },
                new go.Binding("text", "text").makeTwoWay())
            )
        )
    );

    // While dragging, highlight the dragged-over group
    function highlightGroup(grp, show) {
    if (show) {
        const part = myDiagram.toolManager.draggingTool.currentPart;
        if (part.containingGroup !== grp) {
        grp.isHighlighted = true;
        return;
        }
    }
    grp.isHighlighted = false;
    }

    myDiagram.groupTemplate =
    $(go.Group, "Vertical",
        {
            selectable: false,
            selectionObjectName: "SHAPE", // even though its not selectable, this is used in the layout
            layerName: "Background",  // all lanes are always behind all nodes and links
            layout: $(go.GridLayout,  // automatically lay out the lane's subgraph
                {
                wrappingColumn: 1,
                cellSize: new go.Size(1, 1),
                spacing: new go.Size(5, 5),
                alignment: go.GridLayout.Position,
                comparer: (a, b) => {  // can re-order tasks within a lane
                    const ay = a.location.y;
                    const by = b.location.y;
                    if (isNaN(ay) || isNaN(by)) return 0;
                    if (ay < by) return -1;
                    if (ay > by) return 1;
                    return 0;
                }
                }),
            click: (e, grp) => {  // allow simple click on group to clear selection
                if (!e.shift && !e.control && !e.meta) e.diagram.clearSelection();
            },
            computesBoundsAfterDrag: true,  // needed to prevent recomputing Group.placeholder bounds too soon
            handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
            mouseDragEnter: (e, grp, prev) => highlightGroup(grp, true),
            mouseDragLeave: (e, grp, next) => highlightGroup(grp, false),
            mouseDrop: (e, grp) => {  // dropping a copy of some Nodes and Links onto this Group adds them to this Group
                // don't allow drag-and-dropping a mix of regular Nodes and Groups
                if (e.diagram.selection.all(n => !(n instanceof go.Group))) {
                    const ok = grp.addMembers(grp.diagram.selection, true);
                    if (!ok) grp.diagram.currentTool.doCancel();
                }
            },
            subGraphExpandedChanged: grp => {
                const shp = grp.selectionObject;
                if (grp.diagram.undoManager.isUndoingRedoing) return;
                if (grp.isSubGraphExpanded) {
                    shp.width = grp.data.savedBreadth;
                } else {  // remember the original width
                    if (!isNaN(shp.width)) grp.diagram.model.set(grp.data, "savedBreadth", shp.width);
                    shp.width = NaN;
                }
            }
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding("isSubGraphExpanded", "expanded").makeTwoWay(),

        // NOTED: The SubGraphExpanderButton below is an object type within goJS that
        // defines a + (plusline) and - (minusline) to represent expanded or collapsed.
        // It also has a container (TextBlock) associated with it that provides supporting
        // text.  In this case, that supporting text is the column HEADER.
        $(go.Panel, "Horizontal",
            { name: "HEADER", alignment: go.Spot.Left },
            $("SubGraphExpanderButton", { margin: 5 }),  // this remains always visible
            $(go.TextBlock,  // NOTED: The lane HEADER
                { font: "15px Lato, sans-serif", editable: false, margin: new go.Margin(2, 0, 0, 0) },
                // NOTED: This HEADER is hidden when the swimlane is collapsed
                new go.Binding("visible", "isSubGraphExpanded").ofObject(),
                new go.Binding("text").makeTwoWay()
            )
        ),  // end Horizontal Panel
        $(go.Panel, "Auto",  // the lane consisting of a background Shape and a Placeholder representing the subgraph
            $(go.Shape, "Rectangle",  // this is the resized object
                { name: "SHAPE", fill: "#F1F1F1", stroke: null, strokeWidth: 6 },  // strokeWidth controls space between lanes
                new go.Binding("fill", "isHighlighted", h => h ? "#D6D6D6" : "#F1F1F1").ofObject(),  // NOTED: Highlights the column when dragging over it and then resets the color
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
            $(go.Placeholder,
                { padding: 12, alignment: go.Spot.TopLeft }),
            $(go.TextBlock,  // NOTED: This TextBlock is only seen when the swimlane is collapsed
                {
                name: "LABEL", font: "15px Lato, sans-serif", editable: false, // NOTED: This is the HEADER for the column turned 90 degrees
                angle: 90, alignment: go.Spot.TopLeft, margin: new go.Margin(4, 0, 0, 2)
                },
                new go.Binding("visible", "isSubGraphExpanded", e => !e).ofObject(),
                new go.Binding("text").makeTwoWay())
        )  // end Auto Panel
    );  // end Group

    // Set up an unmodeled Part as a legend, and place it directly on the diagram.
    myDiagram.add(
        $(go.Part, "Table",
            { position: new go.Point(10, 10), selectable: false },
            $(go.TextBlock, "Key",
            { row: 0, font: "700 14px Droid Serif, sans-serif" }),  // end row 0
            $(go.Panel, "Horizontal",
            { row: 1, alignment: go.Spot.Left },
            $(go.Shape, "Rectangle",
                { desiredSize: new go.Size(10, 10), fill: '#CC293D', margin: 5 }),
            $(go.TextBlock, "Halted",
                { font: "700 13px Droid Serif, sans-serif" })
            ),  // end row 1
            $(go.Panel, "Horizontal",
            { row: 2, alignment: go.Spot.Left },
            $(go.Shape, "Rectangle",
                { desiredSize: new go.Size(10, 10), fill: '#FFD700', margin: 5 }),
            $(go.TextBlock, "In Progress",
                { font: "700 13px Droid Serif, sans-serif" })
            ),  // end row 2
            $(go.Panel, "Horizontal",
            { row: 3, alignment: go.Spot.Left },
            $(go.Shape, "Rectangle",
                { desiredSize: new go.Size(10, 10), fill: '#009CCC', margin: 5 }),
            $(go.TextBlock, "Completed",
                { font: "700 13px Droid Serif, sans-serif" })
            ),  // end row 3
            $(go.Panel, "Horizontal",
                {
                    row: 4,
                    click: (e, node) => {
                        e.diagram.startTransaction('add node');
                        let sel = e.diagram.selection.first();
                        if (!sel) sel = e.diagram.findTopLevelGroups().first();
                        if (!(sel instanceof go.Group)) sel = sel.containingGroup;
                        if (!sel) return;
                        const newdata = { group: sel.key, loc: "0 9999", text: "New item " + sel.memberParts.count, color: 0 };
                        e.diagram.model.addNodeData(newdata);
                        e.diagram.commitTransaction('add node');
                        const newnode = myDiagram.findNodeForData(newdata);
                        e.diagram.select(newnode);
                        e.diagram.commandHandler.editTextBlock();
                        e.diagram.commandHandler.scrollToPart(newnode);
                    },
                    background: 'white',
                    margin: new go.Margin(10, 4, 4, 4)
                },
                $(go.Panel, "Auto", // NOTED: This is the NEW ITEM green plus sign on the left
                    $(go.Shape, "Rectangle", { strokeWidth: 0, stroke: null, fill: '#6FB583' }),
                    $(go.Shape, "PlusLine", { margin: 4, strokeWidth: 2, width: 10, height: 10, stroke: 'white', background: '#6FB583' })
                ),
                $(go.TextBlock, "New item", { font: '10px Lato, sans-serif', margin: 4, })
            )
        )
    );

    load();

}  // end init

// Show the diagram's model in JSON format
function save() {
    document.getElementById("mySavedModel").value = myDiagram.model.toJson();
    myDiagram.isModified = false;
}
function load() {
    myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
}
window.addEventListener('DOMContentLoaded', init);