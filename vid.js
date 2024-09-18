const playPauseButton=document.getElementById('play-pause-button');
const videoContainer=document.getElementById('player');
const video=document.querySelector('video');
const theatreBtn=document.getElementById('theatre-btn');
const fullScreenBtn=document.getElementById('fullScreen-btn');
const miniPlayerbutton=document.getElementById('miniPlayer-btn');
const volumeBtn=document.getElementById('volume-btn');
const muteBtn=document.querySelector('.volume-mute')
const volumeSlider=document.getElementById('volume-slider');
const currentTime=document.querySelector('.current-time');
const totalTime=document.querySelector('.total-time');
const closedCaptionBtn=document.querySelector('#closed-caption-btn');
const speedButton=document.getElementById('speed-btn');
const previewImg=document.querySelector('.preview-img');
const thumbnailImage=document.querySelector('.thumbnail-image');
const timelineContainer=document.querySelector('.timeline');
const Icons=document.querySelectorAll('.icon');

document.addEventListener('mouseup',(e)=>{
    if (isScrubbing){
        toggleScrubbing(e);
    }
})
document.addEventListener('mousemove',(e)=>{
    if (isScrubbing){
        handleTimelineUpdate(e);
    }
})
miniPlayerbutton.addEventListener('click',()=>{
    toggleMiniPlayer();
    videoContainer.classList.toggle('miniPlayer');
    videoContainer.classList.remove('full-screen');
    videoContainer.classList.remove('theatre');
})

theatreBtn.addEventListener('click',()=>{
    videoContainer.classList.toggle('theatre');
    videoContainer.classList.remove('full-screen');
    Icons.forEach((icon)=>{
        icon.classList.toggle('hide-icon');
    })
})

playPauseButton.addEventListener('click',()=>{
    togglePlay(); 
    videoContainer.classList.toggle('paused');
})

video.addEventListener('click',()=>{
    togglePlay();
    videoContainer.classList.toggle('paused');
})

fullScreenBtn.addEventListener('click',()=>{
    videoContainer.classList.toggle('full-screen');
    videoContainer.classList.remove('theatre');
    Icons.forEach((icon)=>{
        icon.classList.toggle('hide-icon');
    })
})
//timeline
let wasPaused;
let isScrubbing=false;
function toggleScrubbing(e){
    e.preventDefault();
    const rect=timelineContainer.getBoundingClientRect();
    const percent=Math.min(Math.max(0,e.x-rect.x),rect.width)/rect.width;
    isScrubbing=(e.buttons & 1)===1;
    videoContainer.classList.toggle('scrubbing',isScrubbing);
    if(isScrubbing){
        wasPaused=video.paused;
        video.pause();
    }else{
        video.currentTime=percent*video.duration;
        if(!wasPaused){
            videoContainer.classList.remove('paused');
            video.play();
        }
        thumbnailImage.style.display='none'
    }
    handleTimelineUpdate(e);
}
timelineContainer.addEventListener('click',(e)=>{
    e.preventDefault();

})
timelineContainer.addEventListener('mousemove',handleTimelineUpdate)
timelineContainer.addEventListener('mousedown',toggleScrubbing)

function handleTimelineUpdate(e){
    const rect=timelineContainer.getBoundingClientRect();
    const percent=Math.min(Math.max(0,e.x-rect.x),rect.width)/rect.width;
    const previewImageNumber=Math.max(1,Math.floor((percent*video.duration)/1));
    const previewImgSrc=`./thumbnails/${previewImageNumber}.png`;
    previewImg.src=previewImgSrc;
    timelineContainer.style.setProperty('--preview-position',percent);

    if(isScrubbing){
        e.preventDefault();
        thumbnailImage.src=previewImgSrc;
        timelineContainer.style.setProperty('--progress-position',percent);
    }
}
// speed

speedButton.addEventListener('click',changePlayBackSpeed);
function changePlayBackSpeed(){
    let newPlaybackRate=video.playbackRate +0.25;
    if(newPlaybackRate>2){
        newPlaybackRate=0.25;
    }
    video.playbackRate=newPlaybackRate;
    speedButton.textContent=`${newPlaybackRate}x`;
}

// captions

closedCaptionBtn.addEventListener('click',()=>{
    videoContainer.classList.toggle('captions-on');
})

//time
video.addEventListener('loadeddata',()=>{
    totalTime.textContent=formatDuration(video.duration);
})

video.addEventListener('timeupdate',()=>{
    currentTime.textContent=formatDuration(video.currentTime);
    const percent=(video.currentTime/video.duration);
    timelineContainer.style.setProperty('--progress-position',percent);
})
// to show seconds in two digits
const leadingZeroFormatter=new Intl.NumberFormat(undefined,{
    minimumIntegerDigits:2,
})
function formatDuration(time){
    const seconds=Math.floor(time%60)
    const minutes=Math.floor(time/60)%60;
    const hour=Math.floor(time/3600);
    if(hour===0){
        return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
    }else{
        return `${hour}:${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(seconds)}`;
    }

}

// volume
function toggleMute(){
    video.muted=!video.muted;
}
volumeBtn.addEventListener('click',toggleMute);
volumeSlider.addEventListener('input',(e)=>{
    video.volume=e.target.value;
    video.muted=e.target.value===0;
})



video.addEventListener('volumechange',()=>{
    volumeSlider.value=video.volume;
    let volumeLevel;
    if(video.muted || video.volume===0){
        volumeLevel="muted";
        muteBtn.style.display="block";
        volumeSlider.value=0;
    }else if(video.volume>=0.5){
        volumeLevel="high";
        muteBtn.style.display="none";
    }else{
        volumeLevel="low";
        muteBtn.style.display="none";
    }

    videoContainer.dataset.volumeLevel=volumeLevel;
})

document.addEventListener('keydown',(e)=>{
    const tagName=document.activeElement.tagName.toLowerCase();
    //  to check if the selected element is not a input or button to prevent the sapce key from playing video when we are typing of on a button
    if (tagName==='input'){
        return ;
    }
    switch(e.key.toLowerCase()){
        case " ":
            if(tagName==="button"){
                return ;
            }
        case "k":
            videoContainer.classList.toggle('paused');
            togglePlay();
            break;
        case "f":
            videoContainer.classList.toggle('full-screen');
            videoContainer.classList.remove('theatre');
            Icons.forEach((icon)=>{
                icon.classList.toggle('hide-icon');
            })
            break;
        case "t":
            videoContainer.classList.toggle('theatre');
            Icons.forEach((icon)=>{
                icon.classList.toggle('hide-icon');
            })
            videoContainer.classList.remove('full-screen');
            break;
        case "i":
            toggleMiniPlayer();
            videoContainer.classList.toggle('miniPlayer');
            videoContainer.classList.remove('full-screen');
            videoContainer.classList.remove('theatre');
            break;
        case "m":
            toggleMute();
            break;
        case "arrowleft":
        case "j":
            skip(-5);
            break;
        case "arrowright":
        case "l":
            skip(+5);
            break;
    }
})

function togglePlay(){
    video.paused?video.play() : video.pause();
}

function toggleMiniPlayer(){
    if (videoContainer.classList.contains('miniPlayer')){
        document.exitPictureInPicture();
    }else{
        video.requestPictureInPicture();
    }
}

function skip(time){
    video.currentTime+=time;
}

video.addEventListener('ended',()=>{
    videoContainer.classList.toggle('paused');
})
