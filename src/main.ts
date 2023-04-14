/// <reference types="@workadventure/iframe-api-typings" />

import { CreateUIWebsiteEvent } from "@workadventure/iframe-api-typings/front/Api/Events/Ui/UIWebsite";
import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

// Waiting for the API to be ready
WA.onInit().then(() => {
    console.log('Scripting API ready');
    console.log('Player tags: ',WA.player.tags)
    
    const mapUrl = WA.room.mapURL
    const root = mapUrl.substring(0, mapUrl.lastIndexOf("/"))

    const unavailablePage: CreateUIWebsiteEvent = {
        url:  root + "/unavailable.html",
        visible: true,
        allowApi: false,
        allowPolicy: "",   // The list of feature policies allowed
        position: {
            vertical: "middle",
            horizontal: "middle",
        },
        size: {            // Size on the UI (available units: px|em|%|cm|in|pc|pt|mm|ex|vw|vh|rem and others values auto|inherit)
            width: "1100px",
            height: "600px",
        },
    }

    function makeAvailable() {
        applyAvailability(true)
    }

    function makeUnavailable() {
        applyAvailability(false)
    }

    async function applyAvailability(available: boolean) {
        if (available) {
            const websites = await WA.ui.website.getAll()
            if (websites.length) {
                for(let website of websites){
                    if(website.url.includes('unavailable.html')){
                        await website.close()
                    }
                }
            }
            WA.controls.restorePlayerControls()
            WA.controls.restorePlayerProximityMeeting()
        } else {
            WA.controls.disablePlayerControls()
            WA.controls.disablePlayerProximityMeeting()
            WA.ui.website.open(unavailablePage)
        }
    }

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready')

        // Default state
        if (WA.state.available) {
            makeAvailable()
        } else {
            makeUnavailable()
        }

         // Changing state
        WA.state.onVariableChange('available').subscribe((available) => {
            if (available) {
                makeAvailable()
            } else {
                makeUnavailable()
            }
        })
    }).catch(e => console.error(e));
}).catch(e => console.error(e));

export {};