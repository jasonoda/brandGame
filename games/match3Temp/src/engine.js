import * as THREE from 'three';

import AES from 'crypto-js/aes';
import enc from 'crypto-js/enc-utf8';

export default class Engine{
    constructor(input, loader, scene, sounds, utilities, ui, endScore){

        this.input = input;
        this.loader = loader;
        this.s = sounds;
        this.scene = scene;
        this.ui = ui;
        this.u = utilities;
        this.endScore = endScore;

        this.mobile = false;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent ) || window.innerWidth<600) {
            this.mobile = true;
        }

        var testUA = navigator.userAgent;

        if(testUA.toLowerCase().indexOf("android") > -1){
            this.mobile = true;
        }

        this.action = "set up";
        this.count = 0;

        this.loadGame();

    }

    start(){

    }

    update(){

        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);

        //---deltatime--------------------------------------------------------------------------------------------------------------

        var currentTime = new Date().getTime();
        this.dt = (currentTime - this.lastTime) / 1000;
        if (this.dt > 1) {
            this.dt = 0;
        }
        this.lastTime = currentTime;

        // document.getElementById("feedback").innerHTML = this.scene.action;

        if(this.action==="set up"){

            //---end--------------------------------------------------------------------------------------------------------------

            this.serverData = null;
            
            window.addEventListener('message', event => {

                try {

                    const message = JSON.parse(event.data);
                    if (message?.type) {
                        const _0x87c0da = 'V{vTnzr'._0x6cc90a(13);
                        if (message.type === _0x87c0da) {
                            // Case CG_API.InitGame
                            // Decrypt the data
                            const bytes  = AES.decrypt(message.data, 'DrErDE?F:nEsF:AA=A:EEDB:>C?nAABA@r>E'._0x6cc90a(13));
                            this.serverData = JSON.parse(bytes.toString(enc));
                            console.log("LOAD CRYPTO")
                        }
                    }

                } catch (e) {
                    
                    console.log("FAIL:");
                    console.log(e);

                }
            });

            //---end--------------------------------------------------------------------------------------------------------------

            this.scene.buildScene();
            
            this.count=0;
            this.action="build"
            
        }else if(this.action==="build"){

            this.loadOpacity=1;

            this.count+=this.dt;
            if(this.count>1){
                this.action="go";
            }
            
        }else if(this.action==="go"){

            this.loadOpacity-=this.dt*5;
            if(this.loadOpacity<0){
                this.loadOpacity=0;
            }

            document.getElementById("loadingImage").style.opacity = this.loadOpacity+""
            document.getElementById("loadingBack").style.opacity = this.loadOpacity+""

            this.scene.update();
            this.ui.update();

        }

    }

    
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------

    // GENERIC LOADING CODE

    loadGame(){

        this.muteState=false;
        this.mutePosition = 1;

        window.parent.postMessage(JSON.stringify({
            type: 'GameLoaded'
        }), "*");

        this.createMuteButton();

    }

    startGame(){

        window.parent.postMessage(JSON.stringify({
            type: 'GameStart'
        }), "*");

    }

    createMuteButton() {
        
        const storedMuteState = localStorage.getItem("mutestate");
        this.muteState = storedMuteState === "true";
        console.log('Mute state from localStorage:', this.muteState);
        
        if(!this.muteState){
            this.gameStartSound=true;
        }
        
        const muteButton = document.createElement('div');
        muteButton.id = 'muteButton';

        //--------------------------------------------------------------------
        
        let positionStyle;
        if (this.mutePosition === 1 && !this.mobile) {
           
            const centerX = window.innerWidth / 2;
            const leftPosition = centerX - 240;
            positionStyle = `
                position: fixed;
                bottom: 10px;
                left: ${leftPosition}px;
            `;

        } else {
            
            positionStyle = `
                position: fixed;
                bottom: 10px;
                left: 10px;
            `;
            
        }

        muteButton.style.cssText = `
            ${positionStyle}
            width: 20px;
            height: 20px;
            cursor: pointer;
            z-index: 8000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const icon = document.createElement('img');
        icon.src = './src/img/audio_on.svg';
        icon.style.cssText = `
            width: 18px;
            height: 18px;
            pointer-events: none;
            filter: brightness(0);
        `;
        icon.id = 'muteIcon';
        muteButton.appendChild(icon);

        muteButton.addEventListener('click', (e) => {
            console.log('Mute button clicked! Current state:', this.muteState);
            e.preventDefault();
            e.stopPropagation();
            this.toggleMute(!this.muteState);
        });

        muteButton.addEventListener('touchstart', (e) => {
            console.log('Mute button touched! Current state:', this.muteState);
            e.preventDefault();
            this.toggleMute(!this.muteState);
        });

        document.body.appendChild(muteButton);
        
        const icon2 = document.getElementById('muteIcon');
        if (icon2) {
            icon2.src = this.muteState ? './src/images/audio_off.svg' : './src/images/audio_on.svg';
        }
    }

    toggleMute(value) {
        console.log("toggleMute:", value);
        
        this.muteState = value;
        
        localStorage.setItem("mutestate", value.toString());
        
        const icon = document.getElementById('muteIcon');
        const button = document.getElementById('muteButton');
        if (icon && button) {
            if (this.muteState) {
                icon.src = './src/images/audio_off.svg';
            } else {
                icon.src = './src/images/audio_on.svg';
            }
        }
        
        window.parent.postMessage(JSON.stringify({
            type: 'MuteMusic',
            data: { value }
        }), "*");
        
        window.parent.postMessage(JSON.stringify({
            type: 'MuteSounds',
            data: { value }
        }), "*");
    }

    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------


}