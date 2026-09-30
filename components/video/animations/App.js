import React, { Component, props } from "react";
// import { findDOMNode } from 'react-dom'
import ReactPlayer from "../index";
import Duration from "./Duration";
import gsap from "gsap";
import CorrectAnswer from "@/components/animatedUI/correct-answer-2";
import Symbiosis from "@/components/animatedUI/Symbiosis";
import FishSchool from "@/components/animatedUI/FishSchool";

const AUTO_CONTINUE_SECONDS = 20;
// Continue button geometry; the SVG stroke traces the button's rounded border.
const CONTINUE_W = 192;
const CONTINUE_H = 52;
const CONTINUE_RADIUS = 6;

class App extends Component {
  constructor(props) {
      super(props);
  }
  state = {
    url: " ",
    pip: false,
    devOps: false,
    playing: false,
    controls: false,
    light: false,
    volume: 1,
    muted: false,
    played: 0,
    playingBGAudio: false,
    playingCorrectAudio: false,
    playingInCorrectAudio: false,
    playedSeconds: 0,
    loaded: 0,
    duration: 0,
    playbackRate: 1.0,
    loop: false,
    question: 0,
    questionTime: false,
    answerTime: false, //set back to false
    correctQuestion: false, //set back to false
    inCorrectQuestion: false,
    points: 0,
    pointsAdded: 1,
    started: false,
    introLeaving: false,
    introDone: false,
    ended: false,
    playAudioClip: false,
    qTime1: 32, //32
    qTime2: 74, //74
    qTime3: 149,
    qTime4: 196,
    qTime5: 210, //210
    lessonTitle: "Symbiosis",
    lessonInfo: ' Symbiosis is the connection between different species.' +
                  '<br />' +
                  'In this small quiz a team of Clownfish will have to work together' +
                  'with a Sea Anemone for their survival.' +
                  '<br />'+
                  'The questions will test your <strong>intuïtion</strong>. It\'s ok if you don\'t know the answer. You\'ll get it next time.',
    questionTitle: "Symbiosis",
    qInfo: 'Intuïtion Question',
    qFeedback: 'The anemone does sting the Clownfish. It is believed that the clownfish is protected due to a mucus coat on the outside of its skin.',
    q0: 'Correct', // set back to nul
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null,
  };
  load = (url) => {
    this.setState({
      url,
      played: 0,
      loaded: 0,
      pip: false,
    });
  };
  handleStart = (episode) => {
    console.log("playing episode 1");
    let url;

    // // this is loading the video.
    if (episode != 2) {
      url = "./video/symbiosis.mp4";
    } else {
      url = "https://youtu.be/laksjfdljasdf";
    }
    gsap.fromTo(".outer-menu", { autoAlpha: 1 }, { autoAlpha: 0, duration: 1 });
    this.setState({ playing: true, started: true });
    this.load(url);
  };
  // Intro exit: fade the text, let the fish swim out (Symbiosis calls handleSwimOut), then slide to the video.
  startLesson = () => {
    if (this.state.introLeaving || this.isIntroFading) return;
    this.isIntroFading = true;
    this.setState({ playingBGAudio: true });
    gsap.to("#introText, #introStart", {
      autoAlpha: 0,
      y: -12,
      duration: 0.5,
      ease: "power2.in",
      stagger: 0.05,
      onComplete: () => this.setState({ introLeaving: true }),
    });
  };
  // The slide waits for both the level's fish and the white school to leave.
  handleSwimOut = () => {
    this.isLevelFishGone = true;
    this.slideToLesson();
  };
  handleSchoolDone = () => {
    this.isSchoolGone = true;
    this.slideToLesson();
  };
  slideToLesson = () => {
    if (!this.isLevelFishGone || !this.isSchoolGone) return;
    this.handleStart(1);
    gsap.timeline({ onComplete: () => this.setState({ introDone: true }) })
      .to("#intro", { xPercent: -100, duration: 1, ease: "power3.inOut" })
      .fromTo(".player-wrapper", { xPercent: 100 }, { xPercent: 0, duration: 1, ease: "power3.inOut", clearProps: "transform" }, 0);
  };
  handlePlayPause = () => {
    this.setState({ playing: !this.state.playing });
  };
  handleStop = () => {
    this.setState({ url: null, playing: false });
  };
  handleToggleControls = () => {
    const url = this.state.url;
    this.setState(
      {
        controls: !this.state.controls,
        url: null,
      },
      () => this.load(url)
    );
  };
  handleToggleLoop = () => {
    this.setState({ loop: !this.state.loop });
  };
  handleTogglePlayAudio = () => {
    this.setState({ playAudioClip: !this.state.playAudioClip });
  };
  handleTogglePlayCorrectAudio = () => {
    this.setState({ playingCorrectAudio: !this.state.playingCorrectAudio });
  };
  handleTogglePlayInCorrectAudio = () => {
    this.setState({ playingInCorrectAudio: !this.state.playingInCorrectAudio });
  };
  handleVolumeChange = (e) => {
    this.setState({ volume: parseFloat(e.target.value) });
  };
  handleToggleQuestionTime = () => {
    this.setState({ questionTime: !this.state.questionTime });
  };
  handleToggleAnswerTime = () => {
    this.setState({ answerTime: !this.state.answerTime });
  };
  handleToggleCorrectQuestion = () => {
    this.setState({ correctQuestion: !this.state.correctQuestion });
    // CorrectAnswer2()
  };
  handleToggleInCorrectQuestion = () => {
    this.setState({ inCorrectQuestion: !this.state.inCorrectQuestion });
  };
  handleToggleMuted = () => {
    this.setState({ muted: !this.state.muted });
  };
  handleSetPlaybackRate = (e) => {
    this.setState({ playbackRate: parseFloat(e.target.value) });
  };
  handleOnPlaybackRateChange = (speed) => {
    this.setState({ playbackRate: parseFloat(speed) });
  };
  handleTogglePIP = () => {
    this.setState({ pip: !this.state.pip });
  };
  handlePlay = () => {
    console.log("onPlay");
    this.setState({ playing: true });
  };
  handleEnablePIP = () => {
    console.log("onEnablePIP");
    this.setState({ pip: true });
  };
  handleDisablePIP = () => {
    console.log("onDisablePIP");
    this.setState({ pip: false });
  };
  handlePause = () => {
    console.log("onPause");
    this.setState({ playing: false });
  };
  handlePoints = (p) => {
    console.log("AddsPoints");
    this.setState({ points: p });
  };
  handleSeekMouseDown = (e) => {
    this.setState({ seeking: true });
  };
  handleSeekChange = (e) => {
    this.setState({ played: parseFloat(e.target.value) });
  };
  handleSeekMouseUp = (e) => {
    this.setState({ seeking: false });
    this.player.seekTo(parseFloat(e.target.value));
  };
  handleEnded = () => {
    console.log("onEnded");
    this.setState({ ended: !this.state.ended });
  };
  handleDuration = (duration) => {
    console.log("onDuration", duration);
    this.setState({ duration });
  };
  // handleClickFullscreen = () => {
  //   screenfull.request(findDOMNode(this.player))
  // }
  renderLoadButton = (url, label) => {
    return <button onClick={() => this.load(url)}>{label}</button>;
  };
  secondsPlayed = () => {
    this.state.playedSeconds;
  };
  handleProgress = (state, handle) => {
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state);
    }
    // Question Time based on qTime set in state and if the question is the current question.
    if (
      (this.state.playedSeconds > this.state.qTime1) &
        (this.state.question == 0) ||
      (this.state.playedSeconds > this.state.qTime2) &
        (this.state.question == 1) ||
      (this.state.playedSeconds > this.state.qTime3) &
        (this.state.question == 2) ||
      (this.state.playedSeconds > this.state.qTime4) &
        (this.state.question == 3) ||
      (this.state.playedSeconds > this.state.qTime5) &
        (this.state.question == 4)
    ) {
      this.questionTime(2);
    }
  };
  questionTime = (timeAmount) => {
    this.handleToggleQuestionTime();

    // Pick answer order once per question; randomizing in render reshuffled the buttons on every re-render.
    this.setState({ question: this.state.question + 1, answersReversed: Math.random() < 0.5 });

    this.handlePlayPause();
    // this.handleToggleMuted()
    switch (this.state.question) {
      case 1:
        this.setState({
          qInfo: 1,
          qFeedback:
            "The anemone does sting the Clownfish. However the clownfishes skin contains a 'mucu's, a slim film that protects the Clownfish from the poison of the Anemone",
          questionTitle:
            "Why are the poisonous tentacles not affecting the Clownfish?",
          q1: "The sea anemone does not sting the clownfish",
          q0: "The clownfish is immune to the poison",
        });
        break;
      case 2:
        this.setState({
          qInfo: 2,
          qFeedback:
            "Clownfish all begin life as male, but can all carry both female and male reproductive organs. In any given community, the female is the largest fish, the breeding male is the second-largest and the rest are sexually immature males. These immature males can turn into females if the alpha female dies.",
          questionTitle: "How did she became the boss?",
          q0: "She is the boss because she is the oldest",  
          q1: "The former male leader died",
        });
        break;
      case 3:
        this.setState({
          qInfo: 1,
          qFeedback: "Oh crab! Its a perfect home for something else...",
          questionTitle: "Is the shell suitable to lay the eggs?",
          q0: "No",
          q1: "Yes",
        });
        break;
      case 4:
        this.setState({
          qInfo: 1,
          qFeedback:
            "Over 300 million tonnes of plastic are produced each year, and eight million tonnes of that ends up clogging our oceans.",
          questionTitle: "Is the plastic bottle suitable?",
          q0: "No",
          q1: "Yes",
        });
        break;
      case 5:
        this.setState({
          qInfo: 2,
          qFeedback:
            "Symbiosis is any type of a close and long-term biological interaction between two different biological organisms, be it mutualistic, commensalistic, or parasitic.",
          questionTitle:
            "What type of symbiosis do clownfish have with the Sea Anemone?",
          q2: "Commensalism",
          q1: "Parasitism",
          q0: "Mutualism",
        });
        break;
      default:
        this.setState({
          questionTitle: "",
          q1: "The sea anemone does not sting the clownfish",
          q0: "The clownfish is immune to the poison",
        });
    }
    // Runs after the switch so the tweens target this question's rendered title/answers
    // (setState is synchronous here: onProgress fires outside React's event batching).
    this.animateQuestionIn();
  };
  animateQuestionIn = () => {
    gsap.timeline({ defaults: { ease: "power2.out" } })
      .fromTo("#questionTime", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 })
      .fromTo(".questionType", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.3")
      .fromTo("#questionTitle", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.35")
      .fromTo(".question", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12, clearProps: "transform" }, "-=0.3");
  };
  
  // Set every flag explicitly: toggles drifted out of sync after a wrong answer.
  answerQuestion = (isCorrect) => {
    this.setState({
      questionTime: false,
      answerTime: true,
      correctQuestion: isCorrect,
      inCorrectQuestion: !isCorrect,
      playingCorrectAudio: isCorrect,
      playingInCorrectAudio: !isCorrect,
      points: this.state.points + (isCorrect ? this.state.pointsAdded : 0),
    }, this.animateFeedbackIn);
  };
  animateFeedbackIn = () => {
    gsap.fromTo("#correct, #incorrect", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.15, ease: "power3.out" });
    // The border fills clockwise; when the stroke closes the story resumes on its own.
    const progress = document.querySelector("#continueProgress");
    if (!progress) return;
    const perimeter = progress.getTotalLength();
    progress.setAttribute("stroke-dasharray", perimeter);
    progress.setAttribute("stroke-dashoffset", perimeter);
    progress.setAttribute("opacity", 1);
    this.continueTween = gsap.fromTo(progress, { attr: { "stroke-dashoffset": perimeter } }, {
      attr: { "stroke-dashoffset": 0 },
      duration: AUTO_CONTINUE_SECONDS,
      ease: "none",
      onComplete: this.finishAnswer,
    });
  };
  // Fade the overlay out first so the video is revealed smoothly instead of the overlay vanishing.
  finishAnswer = () => {
    if (this.continueTween) this.continueTween.kill();
    this.continueTween = null;
    gsap.to("#questionAnswer", { autoAlpha: 0, duration: 0.5, ease: "power2.in", onComplete: this.resetAnswer });
  };
  resetAnswer = () => {
    this.setState({
      answerTime: false,
      correctQuestion: false,
      inCorrectQuestion: false,
      playingCorrectAudio: false,
      playingInCorrectAudio: false,
      playing: true,
    });
  };
  componentWillUnmount() {
    if (this.continueTween) this.continueTween.kill();
  }
  renderContinueButton = () => (
    <button
      type="button"
      onClick={this.finishAnswer}
      className="link relative block mx-auto mt-12 uppercase font-medium tracking-wide text-base md:text-xl"
      style={{ width: CONTINUE_W, height: CONTINUE_H }}
      aria-label={`Continue (continues automatically after ${AUTO_CONTINUE_SECONDS} seconds)`}
    >
      <svg
        className="absolute inset-0 pointer-events-none"
        width={CONTINUE_W}
        height={CONTINUE_H}
        viewBox={`0 0 ${CONTINUE_W} ${CONTINUE_H}`}
        fill="none"
        aria-hidden="true"
      >
        <rect x="1" y="1" width={CONTINUE_W - 2} height={CONTINUE_H - 2} rx={CONTINUE_RADIUS} stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
        {/* A rect's path starts top-left and runs clockwise; the dash is sized to its perimeter in animateFeedbackIn. */}
        <rect id="continueProgress" x="1" y="1" width={CONTINUE_W - 2} height={CONTINUE_H - 2} rx={CONTINUE_RADIUS} stroke="white" strokeWidth="2" opacity="0" />
      </svg>
      Continue
    </button>
  );
  ref = (player) => {
    this.player = player;
  };
  ref2 = (audioBlock) => {
    this.audioBlock = audioBlock;
  };
  uiSound = (uiSounds) => {
    this.uiSounds = uiSounds;
  };
  uiSound2 = (uiSounds2) => {
    this.uiSounds2 = uiSounds2;
  };
  render() {
    const {
      url,
      playAudioClip,
      qFeedback,
      devOps,
      qInfo,
      playingBGAudio,
      playingCorrectAudio,
      playingInCorrectAudio,
      ended,
      playing,
      controls,
      light,
      volume,
      muted,
      loop,
      played,
      loaded,
      duration,
      playbackRate,
      pip,
      questionTime,
      answerTime,
      correctQuestion,
      inCorrectQuestion,
      questionTitle,
      lessonTitle,
      points,
      question,
      q0,
      q1,
      q2,
      q3,
      q4,
      q5,
      started,
      introLeaving,
      introDone,
    } = this.state;
    const SEPARATOR = " · ";

    return (
      <div className="app">
        {/* POINTS */}
        {/* <Star score={points} animationDelay={2} /> */}
        
        {/* <Lottie animationData={onScoreAdded} style={{height: '100vh', width:'100vw', position:'fixed', left: '50%', top:'0', transform: `translate(-50%, 0)`, PointerEvent:'none'}} /> */}
        <div className="w-full fixed top-0 left-0 h-full pointer-events-none">
          <div className="section-container flex">
            {/* <h2
              className={`${
                points == 0 ? "block" : "block"
              } text-white text-2xl font-semibold relative left-14 top-9`}
            >
              {points}
            </h2> */}
          </div>
        </div>
        {/* QuestionTime */}
        {questionTime && 
          <div id="questionTime" className='fixed overlay justify-center flex items-center opacity-0'>
          <div className="flex-col w-screen h-1/2 flex items-center justify-center">
              {qInfo == 1 &&
                <div className="questionType"><svg className="m-auto fill-current text-white" width="60" height="52"><path d="m35.723 14.403 3.11-5.385a1.382 1.382 0 0 1 2.393 1.382l-3.11 5.385a1.382 1.382 0 0 1-2.393-1.382zM22.224 9.018l3.11 5.385a1.382 1.382 0 0 1-2.394 1.382L19.83 10.4a1.382 1.382 0 0 1 2.394-1.382zM46.838 20.36l5.385-3.11a1.382 1.382 0 1 1 1.382 2.395l-5.386 3.109a1.382 1.382 0 0 1-1.381-2.394zM8.833 17.25l5.386 3.11a1.382 1.382 0 1 1-1.382 2.394l-5.386-3.11a1.382 1.382 0 1 1 1.382-2.393z"/><path d="m30.07 5.119-.077-.055C19.93-1.998 10.428-1.28 4.585 5.561c-5.412 6.337-5.737 16.013-.174 21.581l15.755 15.781 8.012 8.034a2.744 2.744 0 0 0 3.856.033l3.627-3.523 2.803-2.736 2.717-2.662 2.63-2.59 2.543-2.515 2.456-2.442 1.785-1.783 1.86-1.867 2.16-2.179 1.394-1.414c5.522-5.614 4.81-15.37-.907-21.795-6.059-6.812-15.386-7.575-24.708-.61l-.323.245zm22.98 2.202c4.819 5.417 5.412 13.536 1.001 18.02l-1.39 1.41-1.426 1.44-1.463 1.472-2.349 2.352-2.526 2.514-2.62 2.594-2.714 2.674-2.808 2.753-2.902 2.832-2.995 2.911-.735.713-23.77-23.817c-4.478-4.482-4.207-12.531.32-17.833 5.037-5.897 13.315-6.351 22.611.598l.86.642.83-.678C39.56.908 47.741 1.352 53.05 7.321z" /><path d="M30.378 17.059c-3.334 0-6.606 1.088-9.725 2.939-2.049 1.216-3.746 2.578-4.997 3.799l-.256.256-.902.947 1.024 1.071.128.126c1.257 1.227 2.954 2.59 5.003 3.805 3.119 1.85 6.391 2.94 9.725 2.94 3.334 0 6.606-1.09 9.724-2.94 2.05-1.216 3.746-2.578 4.998-3.799l.25-.25.912-.948-1.028-1.076-.128-.126c-1.258-1.227-2.955-2.59-5.004-3.805-3.118-1.85-6.39-2.94-9.724-2.94zm0 2.762c2.767 0 5.57.932 8.288 2.545l.34.206a24.836 24.836 0 0 1 3.227 2.36l.078.067-.08.072a24.907 24.907 0 0 1-3.565 2.563c-2.719 1.613-5.521 2.545-8.288 2.545-2.767 0-5.57-.932-8.288-2.545l-.341-.206a24.836 24.836 0 0 1-3.226-2.36L18.444 25l.081-.071a24.907 24.907 0 0 1 3.565-2.563c2.718-1.613 5.521-2.545 8.288-2.545z"/><path d="M30.38 18.824a7.059 7.059 0 1 0 0 14.117 7.059 7.059 0 0 0 0-14.117zm0 2.823a4.235 4.235 0 1 1 0 8.47 4.235 4.235 0 0 1 0-8.47z" /></svg>
                <span className="block">Intuïtion Question</span></div>
              } 
              {qInfo == 2 &&
                <div className="questionType"><svg className="m-auto fill-current text-white" width="60" height="45"><path d="M30 10.442C22.655 6.457 11.46 4.855 0 4.55v38.572c9.842.262 19.488 1.483 26.668 4.344a9.087 9.087 0 0 0 6.667 0c7.18-2.86 16.822-4.082 26.665-4.344V4.55c-11.46.305-22.655 1.907-30 5.892zM5.25 38.98V9.1c12.892.848 18.817 3.19 22.5 5.089V42.9c-3.813-1.19-11.79-3.28-22.5-3.92zm49.5-.002c-10.708.639-18.688 2.73-22.5 3.922V14.184c3.633-1.877 9.575-4.234 22.5-5.084v29.878zm-4.5-22.464c-5.215.678-11.127 2.225-15 3.636v-2.314c4.17-1.353 9.703-2.86 15-3.536v2.214zm0 6.236c-5.297.676-10.83 2.183-15 3.536V28.6c3.873-1.411 9.785-2.96 15-3.638V22.75zm0-3.9c-5.297.676-10.83 2.183-15 3.536V24.7c3.873-1.411 9.785-2.96 15-3.638V18.85zm0 13c-5.297.676-10.83 2.183-15 3.536V37.7c3.873-1.411 9.785-2.96 15-3.638V31.85zm0-4.55c-5.297.676-10.83 2.183-15 3.536v2.314c3.873-1.411 9.785-2.96 15-3.638V27.3zm-40.5-13c5.297.676 10.83 2.183 15 3.536v2.314c-3.872-1.411-9.785-2.96-15-3.636V14.3zm0 10.662c5.215.678 11.128 2.224 15 3.638v-2.314c-4.17-1.353-9.703-2.86-15-3.536v2.212zm0-3.9c5.215.678 11.128 2.224 15 3.638v-2.314c-4.17-1.353-9.703-2.862-15-3.536v2.212zm0 13c5.215.678 11.128 2.224 15 3.638v-2.314c-4.17-1.353-9.703-2.86-15-3.536v2.212zm0-4.55c5.215.678 11.128 2.224 15 3.638v-2.314c-4.17-1.353-9.703-2.86-15-3.536v2.212z"/></svg>
                  <span className="block">Knowledge Question</span></div>
              } 
              {/* Title */}
              <h2 id='questionTitle' className="text-white text-center font-bold text-4xl relative mb-20 z-50 p-4" >
                {questionTitle}
              </h2>
              
            {/* Answers */}
            <div className={`${ this.state.answersReversed ? 'flex-col-reverse lg:flex-row-reverse' : 'flex-col lg:flex-row' } flex questions gap-8 w-full max-w-xl lg:max-w-none lg:w-auto px-4`} >
              {q0 && <button className='question link' onClick={() => this.answerQuestion(true)}>{q0}</button> }
              {q1 && <button className='question link' onClick={() => this.answerQuestion(false)}>{q1}</button> }
              {q2 && <button className='question link' onClick={() => this.answerQuestion(false)}>{q2}</button> }
              {q3 && <button className='question link' onClick={() => this.answerQuestion(false)}>{q3}</button> }
              {q4 && <button className='question link' onClick={() => this.answerQuestion(false)}>{q4}</button> }
              {q5 && <button className='question link' onClick={() => this.answerQuestion(false)}>{q5}</button> }
            </div>
          </div>
          </div>
        }
        {/* Answer Time */}
        {answerTime && 
          <div id="questionAnswer" className='fixed overlay justify-center flex items-center'>
          {correctQuestion &&  
            <div className="section-container absolute h-screen top-0 pointer-events-none">
              <div className="z-0 left-0 top-0">
                <CorrectAnswer playAnimation={points}></CorrectAnswer>
                {/* <LottieControl/> */}
              </div>
            </div>
          }
          <div className="flex-col section-container flex items-center">
            {correctQuestion && 
            <div id="correct" className="">
              <div className="pt-20">
                
                <h2 className="text-white animate-pulse text-5xl">
                {questionTitle}
                </h2>
                <p className="text-white m-auto max-w-lg mt-9">{qFeedback}</p>
                {this.renderContinueButton()}
              </div>
            </div> 
            }
            {inCorrectQuestion && 
            <div id="incorrect"
              className="fixed">
              <div className="flex-col">
                <h2 className="feedback text-white animate-pulse text-3xl">
                  Oops! not correct
                </h2>
                <h2 className="text-white animate-pulse text-5xl">
                  {questionTitle}
                </h2>
                <p className="text-white max-w-lg mt-9">{qFeedback}</p>
                {this.renderContinueButton()}
              </div>
            </div>
            }
          </div>
          
          </div> 
        }
        {!introDone &&
        <div id="intro" className="overview fixed inset-0 z-30 overflow-x-hidden overflow-y-auto md:overflow-hidden">
          <div className="link cursor-pointer" onClick={this.startLesson}>
            <Symbiosis isLeaving={introLeaving} onSwimOut={this.handleSwimOut} />
          </div>
          <FishSchool isSwimming={introLeaving} originSelector="#HOVER" onDone={this.handleSchoolDone} />
          <div id="introText" className="intro-text relative md:absolute md:right-0 md:top-0 md:h-full w-full md:w-3/5 flex flex-col md:justify-center text-left px-6 md:pl-32 md:pr-16 pointer-events-none">
            <h1 className="text-white text-left font-bold text-5xl">{lessonTitle}</h1>
            <p className="mb-6 mt-3 text-left">
              Symbiosis is the connection between different species.
            </p>
            <h3 className="my-5 text-3xl font-medium">Different types of symbiosis are</h3>
            <p>
              <strong>Commensalism</strong> (One benefits and the other derives neither benefit nor harm), <br />
              <strong>Parasitism</strong> (One benefits at the expense of the other), <br />
              <strong>Mutualism</strong> (Where all species involved benefit from their interactions), <br />
              <br />
              In this small quiz a team of Clownfish will have to work together
              with a Sea Anemone for their survival.
              <br />
              The questions will test your knowledge &amp; <strong>intuïtion</strong>. It&apos;s ok if you don&apos;t know the answer. You&apos;ll get it next time.
            </p>
          </div>
          <div id="introStart" className="relative md:absolute md:bottom-10 md:left-0 md:right-0 flex justify-center py-10 md:py-0">
            <button
              type="button"
              className="w-48 py-2 font-medium border-2 uppercase border-white rounded-md text-base md:text-xl tracking-wide link"
              onClick={this.startLesson}
            >
              Start
            </button>
          </div>
        </div>
        }
        {ended && 
        <div className='fixed overlay justify-center flex items-center'>
          <div className="flex-col w-screen h-1/2 flex items-center justify-center">
            <h1 className="text-white text-center font-bold text-5xl relative z-50">
              Completed Symbiosis
            </h1>
            <h2 className="text-white mt-8 text-3xl">With a total of</h2>
            <CorrectAnswer playAnimation={points}></CorrectAnswer>
            <p className="my-9">
              To enhance the experience I would love your feedback, <br />
              This experience is brought to you by Bart Slot. This is my grduation project for my study: interaction design at the Univeristy of the Arts, Utrecht.
            </p>
            <a
              href={"https://forms.gle/PPLoJFJanmvxTFeBA"}
              target={"_blank"}
              rel="noreferrer"
              className="link"
            >
              <button
                className="py-2 px-7 font-medium border-2 uppercase border-white bg-white rounded-md text-base text-black
              md:text-xl tracking-wide duration-300 z-50 link"
              >
                Send feedback
              </button>
            </a>
          </div>
          </div>
        }
        {devOps && 
          <div style={{zIndex: 1000, position: "fixed", left: "50px", top: "103px"}}>
            <table>
              <tbody>
                <tr>
                  <th>Controls</th>
                  <td>
                    <button onClick={this.handleStop}>Stop</button>
                    <button onClick={this.handlePlayPause}>
                      {playing ? "Pause" : "Play"}
                    </button>
                    <button onClick={this.handleClickFullscreen}>
                      Fullscreen
                    </button>
                    {light && (
                      <button onClick={() => this.player.showPreview()}>
                        Show preview
                      </button>
                    )}
                    {ReactPlayer.canEnablePIP(url) && (
                      <button onClick={this.handleTogglePIP}>
                        {pip ? "Disable PiP" : "Enable PiP"}
                      </button>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Speed</th>
                  <td>
                    <button onClick={this.handleSetPlaybackRate} value={1}>
                      1x
                    </button>
                    <button onClick={this.handleSetPlaybackRate} value={1.5}>
                      1.5x
                    </button>
                    <button onClick={this.handleSetPlaybackRate} value={2}>
                      2x
                    </button>
                  </td>
                </tr>
                <tr>
                  <th>Seek</th>
                  <td>
                    <input
                      type="range"
                      min={0}
                      max={0.999999}
                      step="any"
                      value={played}
                      onMouseDown={this.handleSeekMouseDown}
                      onChange={this.handleSeekChange}
                      onMouseUp={this.handleSeekMouseUp}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Volume</th>
                  <td>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step="any"
                      value={volume}
                      onChange={this.handleVolumeChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>
                    <label htmlFor="controls">Controls</label>
                  </th>
                  <td>
                    <input
                      id="controls"
                      type="checkbox"
                      checked={controls}
                      onChange={this.handleToggleControls}
                    />
                    <span>&nbsp; Requires player reload</span>
                  </td>
                </tr>
                <tr>
                  <th>
                    <label htmlFor="muted">Muted</label>
                  </th>
                  <td>
                    <input
                      id="muted"
                      type="checkbox"
                      checked={muted}
                      onChange={this.handleToggleMuted}
                    />
                  </td>
                </tr>
                <tr>
                  <th>
                    <label htmlFor="loop">Loop</label>
                  </th>
                  <td>
                    <input
                      id="loop"
                      type="checkbox"
                      checked={loop}
                      onChange={this.handleToggleLoop}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Played</th>
                  <td>
                    <progress max={1} value={played} />
                  </td>
                </tr>
                <tr>
                  <th>Loaded</th>
                  <td>
                    <progress max={1} value={loaded} />
                  </td>
                </tr>
              </tbody>
            </table>
            <table>
              <tbody>
                <tr>
                  <th>questionTime</th>
                  <td>{questionTime ? "true" : "false"}</td>
                </tr>
                <tr>
                  <th>answerTime</th>
                  <td>{answerTime ? "true" : "false"}</td>
                </tr>
                <tr>
                  <th>question</th>
                  <td>{question}</td>
                </tr>
                <tr>
                  <th>question</th>
                  <td>{question}</td>
                </tr>
                <tr>
                  <th>url</th>
                  <td className={!url ? "faded" : ""}>
                    {(url instanceof Array ? "Multiple" : url) || "null"}
                  </td>
                </tr>
                <tr>
                  <th>playing</th>
                  <td>{playing ? "true" : "false"}</td>
                </tr>
                <tr>
                  <th>volume</th>
                  <td>{volume.toFixed(3)}</td>
                </tr>
                <tr>
                  <th>speed</th>
                  <td>{playbackRate}</td>
                </tr>
                <tr>
                  <th>played</th>
                  <td>{played.toFixed(3)}</td>
                </tr>
                <tr>
                  <th>loaded</th>
                  <td>{loaded.toFixed(3)}</td>
                </tr>
                <tr>
                  <th>duration</th>
                  <td>
                    <Duration seconds={duration} />
                  </td>
                </tr>
                <tr>
                  <th>elapsed</th>
                  <td>
                    <Duration seconds={duration * played} />
                  </td>
                </tr>
                <tr>
                  <th>remaining</th>
                  <td>
                    <Duration seconds={duration * (1 - played)} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        }
        <div className="player-wrapper absolute pointer-events-none h-screen w-screen -z-1 left-0 top-0">
        
          <ReactPlayer
            ref={this.ref}
            className="react-player bg-cover"
            width="100%"
            height="100%"
            url={url}
            pip={pip}
            playing={playing}
            controls={controls}
            light={light}
            loop={loop}
            playbackRate={playbackRate}
            volume={volume}
            muted={muted}
            onReady={() => console.log("onReady")}
            onStart={() => console.log("onStart")}
            onPlay={this.handlePlay}
            onEnablePIP={this.handleEnablePIP}
            onDisablePIP={this.handleDisablePIP}
            onPause={this.handlePause}
            onBuffer={() => console.log("onBuffer")}
            onPlaybackRateChange={this.handleOnPlaybackRateChange}
            onSeek={(e) => console.log("onSeek", e)}
            onEnded={this.handleEnded}
            onError={(e) => console.log("onError", e)}
            onProgress={this.handleProgress}
            onDuration={this.handleDuration}
          />
        
        <ReactPlayer
          ref={this.ref2}
          url="./audio/symbiosis.mp3"
          playing={playingBGAudio}
          loop={true}
          controls={false}
          className="hidden"
          volume={0.6}
        />
        <ReactPlayer
          url="./audio/correct2.mp3"
          ref={this.uiSound}
          playing={playingCorrectAudio}
          loop={false}
          controls={false}
          className="hidden"
          volume={1}
        />
        <ReactPlayer
          url="./audio/inCorrect.mp3"
          ref={this.uiSound2}
          playing={playingInCorrectAudio}
          loop={false}
          controls={false}
          className="hidden"
          volume={1}
        />
        <ReactPlayer
          ref={this.ref2}
          url="./audio/water.wav"
          playing={playAudioClip}
          loop={true}
          controls={false}
          volume={1}
          className="hidden"
        />
        </div>
      
      </div>
    );
  }
}

export default App;