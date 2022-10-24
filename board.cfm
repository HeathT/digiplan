<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Digiplan - Kanban Board</title>
        <link rel="icon" type="image/x-icon" href="images/favicon.ico" />
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"/>
        <meta name="description" content="An interactive Kanban board editor, a visual control used for organizing work items."/>
        <link rel="stylesheet" href="css/board.css"/> 
        <style>
            body {
                font-family: Arial, Helvetica, sans-serif;
            }
            .smallText {
                font-size: smaller;
            }
        </style>
        <script type="text/javascript" src="js/go.js"></script>
        <link href='https://fonts.googleapis.com/css?family=Lato:300,400,700' rel='stylesheet' type='text/css'>
        
        <script type="text/javascript" src="js/kanban.js"></script>
    </head>
    
    <body>
        <div class="md:flex flex-col md:flex-row md:min-h-screen w-full max-w-screen-xl mx-auto">
            <!-- <div id="navSide" class="flex flex-col w-full md:w-48 text-gray-700 bg-white flex-shrink-0"></div> -->
            <!-- * * * * * * * * * * * * * -->
            <!-- Start of GoJS sample code -->
            
            <div id="allSampleContent" class="p-4 w-full">
            
            
        
        <div id="stuff">
            <div id="myDiagramDiv" style="border: solid 1px black; width:100%; height:500px;"></div>
            <div style="display:none !important;">
                <p>A Kanban board is a work and workflow visualization used to communicate the status and progress of work items. Click on the color of a note to cycle through colors.</p>
                <p>
                    Adapted from the <a href="swimLanesVertical.html">Swim Lanes (vertical)</a> sample.
                    <!-- Unlike that sample:
                    <ul>
                        <li>there are no Links</li>
                        <li>lanes cannot be nested into "pools"</li>
                        <li>lanes cannot be resized</li>
                        <li>the user cannot drop tasks into the diagram's background</li>
                        <li>all tasks are ordered within a single column; the user can rearrange the order</li>
                        <li>tasks can freely be moved into other lanes</li>
                        <li>lanes are not movable or copyable or deletable</li>
                    </ul> -->
                </p>
                <button id="SaveButton" onclick="save()">Save</button>
                <button onclick="load()">Load</button>
                Diagram Model saved in JSON format:
                <br />
                <textarea id="mySavedModel" style="width:100%;height:300px;">
                    {
                        "class": "go.GraphLinksModel",
                        "nodeDataArray": [
                            {"key":"Backlog", "text":"Backlog", "isGroup":true, "loc":"0 23.52284749830794" },
                            {"key":"Approved", "text":"Approved", "isGroup":true, "color":"0", "loc":"109 23.52284749830794" },
                            {"key":"Development", "text":"In Development", "isGroup":true, "color":"0", "loc":"235 23.52284749830794" },
                            {"key":"DevAssigned", "text":"Dev: Assigned", "isGroup":true, "color":"0", "loc":"343 23.52284749830794" },
                            {"key":"QA", "text":"In QA", "isGroup":true, "color":"0", "loc":"451 23.52284749830794"},
                            {"key":"QAAssigned", "text":"QA: Assigned", "isGroup":true, "color":"0", "loc":"562 23.52284749830794" },
                            {"key":"Staged", "text":"Staged", "isGroup":true, "color":"0", "loc":"671 23.52284749830794" },
                            {"key":"Prod", "text":"In Production", "isGroup":true, "color":"0", "loc":"780 23.52284749830794" },
                            {"key":-1, "group":"Backlog", "category":"newbutton",  "loc":"12 35.52284749830794" },
                            {"key":1, "text":"text for oneA", "group":"Backlog", "color":"0", "loc":"12 35.52284749830794"},
                            {"key":2, "text":"text for oneB", "group":"Backlog", "color":"1", "loc":"12 65.52284749830794"},
                            {"key":3, "text":"text for oneC", "group":"Backlog", "color":"0", "loc":"12 95.52284749830794"},
                            {"key":4, "text":"text for oneD", "group":"Backlog", "color":"1", "loc":"12 125.52284749830794"},
                            {"key":5, "text":"text for twoA", "group":"Approved", "color":"1", "loc":"121 35.52284749830794"},
                            {"key":6, "text":"text for twoB", "group":"Approved", "color":"1", "loc":"121 65.52284749830794"},
                            {"key":7, "text":"text for twoC", "group":"Development", "color":"0", "loc":"247 35.52284749830794"},
                            {"key":8, "text":"text for twoD", "group":"DevAssigned", "color":"0", "loc":"355 35.52284749830794"},
                            {"key":9, "text":"text for twoE", "group":"QA", "color":"0", "loc":"463 35.52284749830794"},
                            {"key":10, "text":"text for twoF", "group":"QA", "color":"1", "loc":"463 65.52284749830794"},
                            {"key":11, "text":"text for twoG", "group":"QAAssigned", "color":"0", "loc":"574 35.52284749830794"},
                            {"key":12, "text":"text for fourA", "group":"Staged", "color":"1", "loc":"683 35.52284749830794"},
                            {"key":13, "text":"text for fourB", "group":"Staged", "color":"1", "loc":"683 65.52284749830794"},
                            {"key":14, "text":"text for fourC", "group":"Staged", "color":"1", "loc":"683 95.52284749830794"},
                            {"key":15, "text":"text for fourD", "group":"Staged", "color":"0", "loc":"683 125.52284749830794"},
                            {"key":16, "text":"text for fiveA", "group":"Staged", "color":"0", "loc":"683 155.52284749830795"},
                            {"key":17, "text":"text for sixA", "group":"Prod", "color":"0", "loc":"791 155.52284749830795"}
                        ],
                        "linkDataArray": []
                    }
                </textarea>
            </div>
        </div>
        </div>
        
    </body>
</html>