import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const VIEWBOX_WIDTH = 580;
const SWIMMERS = "#Fish1, #Fish3, .Fish2, #Clownfish";
const TENTACLES = "#SeaAnemone > path";
const TENTACLE_SWAY_SECONDS = 2.4;

const isClownfish = (el) => el.id === "Clownfish";
// #Fish1 and .Fish2 are drawn facing left; the rest face right.
const headingOf = (el) => (el.id === "Fish1" || el.classList.contains("Fish2") ? -1 : 1);

// Sway each tentacle from its base; delay by x so a current ripples across the anemone.
const swayTentacles = (tentacles) => {
  const lefts = tentacles.map((el) => el.getBoundingClientRect().left);
  const minLeft = Math.min(...lefts);
  const span = Math.max(...lefts) - minLeft || 1;
  tentacles.forEach((el, i) => {
    gsap.fromTo(el,
      { skewX: -3, rotate: -2 },
      {
        skewX: 3,
        rotate: 2,
        duration: TENTACLE_SWAY_SECONDS * gsap.utils.random(0.85, 1.15),
        ease: "sine.inOut",
        transformOrigin: "50% 100%",
        repeat: -1,
        yoyo: true,
        delay: ((lefts[i] - minLeft) / span) * TENTACLE_SWAY_SECONDS,
      });
  });
};

// Idle: a gentle bob and tilt, plus a forward dart every few seconds.
// The dart winds up first (ease back, squash), bursts forward, then glides home.
const swimIdle = (el) => {
  const heading = headingOf(el);
  const dart = isClownfish(el) ? 8 : 18;
  gsap.set(el, { transformOrigin: "50% 50%" });
  gsap.to(el, { y: gsap.utils.random(3, 6), duration: gsap.utils.random(1.4, 2), ease: "sine.inOut", repeat: -1, yoyo: true });
  gsap.fromTo(el, { rotate: -2 }, { rotate: 2, duration: gsap.utils.random(0.9, 1.3), ease: "sine.inOut", repeat: -1, yoyo: true });
  gsap.timeline({ repeat: -1, repeatDelay: gsap.utils.random(1.5, 3.5), delay: gsap.utils.random(0, 2.5) })
    .to(el, { x: -heading * dart * 0.3, scaleX: 0.9, scaleY: 1.06, duration: 0.35, ease: "power2.out" })
    .to(el, { x: heading * dart, scaleX: 1.04, scaleY: 0.97, duration: 0.3, ease: "power3.out" })
    .to(el, { scaleX: 1, scaleY: 1, duration: 0.3, ease: "power1.out" }, "<0.2")
    .to(el, { x: 0, duration: 2.2, ease: "sine.inOut" });
};

// Leave: turn to face right, wind up, then burst off-screen with a quick body wiggle.
const swimOut = (el, offscreenX, delay) => {
  const turn = headingOf(el) === -1;
  const tl = gsap.timeline({ delay });
  if (turn) tl.to(el, { scaleX: -1, duration: 0.25, ease: "power2.inOut" });
  const facing = turn ? -1 : 1;
  tl.to(el, { x: `-=${12}`, scaleX: 0.85 * facing, scaleY: 1.1, rotate: 0, duration: 0.3, ease: "power2.out" })
    .to(el, { x: `+=${offscreenX}`, scaleX: 1.05 * facing, scaleY: 0.95, duration: 1.1, ease: "power2.in" })
    .fromTo(el, { rotate: -6 }, { rotate: 6, duration: 0.09, ease: "sine.inOut", repeat: 11, yoyo: true }, "<");
  return tl;
};

const Symbiosis = ({ isLeaving = false, onSwimOut }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const fish = [...svgRef.current.querySelectorAll(SWIMMERS)];
    const tentacles = [...svgRef.current.querySelectorAll(TENTACLES)];
    fish.forEach(swimIdle);
    swayTentacles(tentacles);
    return () => {
      gsap.killTweensOf(fish);
      gsap.killTweensOf(tentacles);
    };
  }, []);

  useEffect(() => {
    if (!isLeaving) return;
    const svg = svgRef.current;
    const fish = [...svg.querySelectorAll(SWIMMERS)];
    gsap.killTweensOf(fish);

    // Distance to just past the right edge of the viewport, in SVG units.
    const scale = svg.getBoundingClientRect().width / VIEWBOX_WIDTH;
    const offscreenX = (el) => (window.innerWidth - el.getBoundingClientRect().left) / scale + 60;

    const tl = gsap.timeline({ onComplete: onSwimOut });
    fish.forEach((el, i) => tl.add(swimOut(el, offscreenX(el), i * 0.08), 0));
    return () => tl.kill();
  }, [isLeaving, onSwimOut]);

  return (
    <svg
      height="473px"
      width="580px"
      version="1.1"
      viewBox="0 0 580 473"
      xmlns="http://www.w3.org/2000/svg"
      id="SymbiosisSVG"
      ref={svgRef}
      style={{ overflow: "visible", maxWidth: "100vw", height: "auto" }}
    >
      <title>Symbiosis</title>
      <defs>
        <linearGradient
          id="linearGradient-2"
          x1="8.69713363%"
          x2="61.666933%"
          y1="38.6023509%"
          y2="73.8818923%"
        >
          <stop offset="0%" stopColor="#756F5E" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-3"
          x1="95.6874789%"
          x2="-0.795401624%"
          y1="44.7254524%"
          y2="55.1893156%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-4"
          x1="43.6802515%"
          x2="55.2491205%"
          y1="13.7703733%"
          y2="121.525497%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-5"
          x1="8.69713363%"
          x2="61.666933%"
          y1="44.3727623%"
          y2="61.7909476%"
        >
          <stop offset="0%" stopColor="#756F5E" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-6"
          x1="99.5705429%"
          x2="0.834086447%"
          y1="45.339951%"
          y2="51.8537904%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-7"
          x1="41.6469093%"
          x2="75.6962431%"
          y1="28.3775473%"
          y2="94.9587881%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-8"
          x1="8.69713363%"
          x2="61.666933%"
          y1="41.8264682%"
          y2="67.1262868%"
        >
          <stop offset="0%" stopColor="#756F5E" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-9"
          x1="34.7611064%"
          x2="75.0202723%"
          y1="26.2126829%"
          y2="72.0383014%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-10"
          x1="49.0214877%"
          x2="61.666933%"
          y1="29.8017742%"
          y2="76.6018707%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-11"
          x1="42.4804174%"
          x2="53.0053617%"
          y1="84.8508614%"
          y2="30.9649426%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-12"
          x1="14.5894493%"
          x2="60.0025146%"
          y1="20.6005543%"
          y2="111.601686%"
        >
          <stop offset="0%" stopColor="#756F5E" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-13"
          x1="51.1257436%"
          x2="49.4819708%"
          y1="86.1580702%"
          y2="4.5614118%"
        >
          <stop offset="0%" stopColor="#020708" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-14"
          x1="31.6643849%"
          x2="63.5984072%"
          y1="37.5326867%"
          y2="92.4963824%"
        >
          <stop offset="0%" stopColor="#262221" />
          <stop offset="61.29%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#4B473B" />
        </linearGradient>
        <linearGradient
          id="linearGradient-15"
          x1="49.6647096%"
          x2="53.9977117%"
          y1="3.22717084%"
          y2="111.601686%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-16"
          x1="45.9085037%"
          x2="55.6960179%"
          y1="4.58073914%"
          y2="112.211479%"
        >
          <stop offset="0%" stopColor="#77AFBC" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-17"
          x1="49.0369942%"
          x2="52.7249827%"
          y1="4.19529647%"
          y2="110.244873%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#7AB1BE" />
        </linearGradient>
        <linearGradient
          id="linearGradient-18"
          x1="49.4764693%"
          x2="51.6203687%"
          y1="4.96477127%"
          y2="111.102334%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-19"
          x1="50%"
          x2="61.666933%"
          y1="38.9208827%"
          y2="70.2800497%"
        >
          <stop offset="0%" stopColor="#1D1B1A" />
          <stop offset="61.29%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#4B473B" />
        </linearGradient>
        <linearGradient
          id="linearGradient-20"
          x1="47.3226649%"
          x2="52.9734061%"
          y1="3.31433416%"
          y2="114.210349%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-21"
          x1="42.8937774%"
          x2="56.631542%"
          y1="-0.0168794128%"
          y2="117.433132%"
        >
          <stop offset="0%" stopColor="#77AFBC" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-22"
          x1="45.067462%"
          x2="55.4297269%"
          y1="5.88387298%"
          y2="116.330484%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#7AB1BE" />
        </linearGradient>
        <linearGradient
          id="linearGradient-23"
          x1="47.7872074%"
          x2="53.0964628%"
          y1="3.44864759%"
          y2="113.83561%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-24"
          x1="49.0214877%"
          x2="61.666933%"
          y1="10.4114774%"
          y2="102.139667%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-25"
          x1="49.0214877%"
          x2="61.666933%"
          y1="22.3237697%"
          y2="86.4507015%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-26"
          x1="44.7863444%"
          x2="57.902726%"
          y1="1.06523113%"
          y2="114.677631%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-27"
          x1="48.9688148%"
          x2="58.463315%"
          y1="20.0934283%"
          y2="90.7629311%"
        >
          <stop offset="0%" stopColor="#77AFBC" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-28"
          x1="47.2712318%"
          x2="57.8056877%"
          y1="19.6456187%"
          y2="88.0986215%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#7AB1BE" />
        </linearGradient>
        <linearGradient
          id="linearGradient-29"
          x1="46.9425834%"
          x2="54.44903%"
          y1="1.65159182%"
          y2="113.907717%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-30"
          x1="49.0214877%"
          x2="61.666933%"
          y1="21.7053256%"
          y2="87.2652172%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-31"
          x1="49.2701592%"
          x2="58.7019893%"
          y1="3.22717084%"
          y2="111.601686%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-32"
          x1="47.3795102%"
          x2="54.4368764%"
          y1="6.17472945%"
          y2="108.848597%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#7AB1BE" />
        </linearGradient>
        <linearGradient
          id="linearGradient-33"
          x1="45.3110818%"
          x2="56.1659817%"
          y1="0.732230262%"
          y2="116.838291%"
        >
          <stop offset="0%" stopColor="#77AFBC" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-34"
          x1="47.7086661%"
          x2="54.4980013%"
          y1="6.10566364%"
          y2="110.47966%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-35"
          x1="22.7644912%"
          x2="50%"
          y1="19.4217295%"
          y2="88.5474145%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-36"
          x1="49.9365853%"
          x2="53.5657353%"
          y1="22.6704796%"
          y2="111.742258%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-37"
          x1="49.8830749%"
          x2="52.544872%"
          y1="22.7751302%"
          y2="111.757483%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-38"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-39"
          x1="50%"
          x2="50%"
          y1="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FACD0C" />
          <stop offset="100%" stopColor="#F29F05" />
        </linearGradient>
        <linearGradient
          id="linearGradient-40"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-41"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-42"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-43"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-44"
          x1="50%"
          x2="50%"
          y1="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FACD0C" />
          <stop offset="100%" stopColor="#F29F05" />
        </linearGradient>
        <linearGradient
          id="linearGradient-45"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-46"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-47"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-48"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-49"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-50"
          x1="50%"
          x2="50%"
          y1="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FACD0C" />
          <stop offset="100%" stopColor="#F29F05" />
        </linearGradient>
        <linearGradient
          id="linearGradient-51"
          x1="50%"
          x2="50%"
          y1="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FACD0C" />
          <stop offset="100%" stopColor="#F29F05" />
        </linearGradient>
        <linearGradient
          id="linearGradient-52"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-53"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-54"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-55"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-56"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-57"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-58"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-59"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-60"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-61"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-62"
          x1="8.69713363%"
          x2="61.666933%"
          y1="38.1482604%"
          y2="74.8333639%"
        >
          <stop offset="0%" stopColor="#756F5E" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-63"
          x1="95.6874789%"
          x2="-0.795401624%"
          y1="44.5603465%"
          y2="55.3517535%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-64"
          x1="43.8630817%"
          x2="55.0972635%"
          y1="13.7703733%"
          y2="121.525497%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-65"
          x1="8.69713363%"
          x2="61.666933%"
          y1="44.3223104%"
          y2="61.8966613%"
        >
          <stop offset="0%" stopColor="#756F5E" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-66"
          x1="99.5705429%"
          x2="0.834086447%"
          y1="45.0731716%"
          y2="51.9599166%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-67"
          x1="41.6469093%"
          x2="75.6962431%"
          y1="29.2716019%"
          y2="93.0998125%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-68"
          x1="8.69713363%"
          x2="61.666933%"
          y1="41.6609747%"
          y2="67.4730511%"
        >
          <stop offset="0%" stopColor="#756F5E" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-69"
          x1="34.7611064%"
          x2="75.0202723%"
          y1="25.8109894%"
          y2="72.4104595%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-70"
          x1="49.0214877%"
          x2="61.666933%"
          y1="29.961955%"
          y2="76.3909061%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-71"
          x1="42.4804174%"
          x2="53.0053617%"
          y1="86.7484409%"
          y2="29.928511%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-72"
          x1="11.5978611%"
          x2="60.8475566%"
          y1="20.6005543%"
          y2="111.601686%"
        >
          <stop offset="0%" stopColor="#756F5E" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-73"
          x1="51.3625922%"
          x2="49.3729811%"
          y1="86.1580702%"
          y2="4.5614118%"
        >
          <stop offset="0%" stopColor="#020708" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-74"
          x1="49.4970281%"
          x2="55.9970015%"
          y1="3.22717084%"
          y2="111.601686%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-75"
          x1="49.654452%"
          x2="54.1200149%"
          y1="3.22717084%"
          y2="111.601686%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-76"
          x1="45.9437372%"
          x2="55.6469671%"
          y1="4.58073914%"
          y2="112.211479%"
        >
          <stop offset="0%" stopColor="#77AFBC" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-77"
          x1="48.9701781%"
          x2="52.91405%"
          y1="4.19529647%"
          y2="110.244873%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#7AB1BE" />
        </linearGradient>
        <linearGradient
          id="linearGradient-78"
          x1="61.666933%"
          x2="49.0214877%"
          y1="70.1001139%"
          y2="34.7384177%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-79"
          x1="49.5054595%"
          x2="51.5306418%"
          y1="4.96477127%"
          y2="111.102334%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-80"
          x1="47.3008032%"
          x2="52.9976854%"
          y1="3.31433416%"
          y2="114.210349%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-81"
          x1="42.8772447%"
          x2="56.6469704%"
          y1="-0.0168794128%"
          y2="117.433132%"
        >
          <stop offset="0%" stopColor="#77AFBC" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-82"
          x1="45.0465916%"
          x2="55.4527011%"
          y1="5.88387298%"
          y2="116.330484%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#7AB1BE" />
        </linearGradient>
        <linearGradient
          id="linearGradient-83"
          x1="47.7516822%"
          x2="53.1461749%"
          y1="3.44864759%"
          y2="113.83561%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-84"
          x1="49.0214877%"
          x2="61.666933%"
          y1="12.8656121%"
          y2="98.9074731%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-85"
          x1="61.666933%"
          x2="49.0214877%"
          y1="87.2789752%"
          y2="21.6948794%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-86"
          x1="45.054554%"
          x2="57.4961807%"
          y1="1.06523113%"
          y2="114.677631%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-87"
          x1="48.9688148%"
          x2="58.463315%"
          y1="21.4583725%"
          y2="88.9024996%"
        >
          <stop offset="0%" stopColor="#77AFBC" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-88"
          x1="47.2712318%"
          x2="57.8056877%"
          y1="17.2170907%"
          y2="91.146734%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#7AB1BE" />
        </linearGradient>
        <linearGradient
          id="linearGradient-89"
          x1="47.1822394%"
          x2="54.1002923%"
          y1="1.65159182%"
          y2="113.907717%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-90"
          x1="61.666933%"
          x2="49.0214877%"
          y1="89.5178842%"
          y2="19.9949242%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-91"
          x1="49.2460312%"
          x2="58.9896707%"
          y1="3.22717084%"
          y2="111.601686%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-92"
          x1="47.4615858%"
          x2="54.2979102%"
          y1="6.17472945%"
          y2="108.848597%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#7AB1BE" />
        </linearGradient>
        <linearGradient
          id="linearGradient-93"
          x1="45.3019723%"
          x2="56.1779608%"
          y1="0.732230262%"
          y2="116.838291%"
        >
          <stop offset="0%" stopColor="#77AFBC" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-94"
          x1="47.8264027%"
          x2="54.2668785%"
          y1="6.10566364%"
          y2="110.47966%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-95"
          x1="22.3821186%"
          x2="50%"
          y1="19.4217295%"
          y2="88.5474145%"
        >
          <stop offset="0%" stopColor="#4B473B" />
          <stop offset="38.71%" stopColor="#463D33" />
          <stop offset="100%" stopColor="#262221" />
        </linearGradient>
        <linearGradient
          id="linearGradient-96"
          x1="49.9407996%"
          x2="53.3287746%"
          y1="22.6704796%"
          y2="111.742258%"
        >
          <stop offset="0.5376344%" stopColor="#1C7A90" />
          <stop offset="100%" stopColor="#020708" />
        </linearGradient>
        <linearGradient
          id="linearGradient-97"
          x1="49.8793909%"
          x2="52.6250547%"
          y1="22.7751302%"
          y2="111.757483%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="99.46%" stopColor="#1C7A90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-98"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-99"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-100"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-101"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-102"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-103"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-104"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-105"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-106"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-107"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-108"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-109"
          x1="50.1085227%"
          x2="50.1085227%"
          y1="95.3183164%"
          y2="36.2910601%"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.637079839" />
          <stop offset="100%" stopColor="#63F8FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="linearGradient-110"
          x1="50.1085227%"
          x2="50.1085227%"
          y1="101.827073%"
          y2="14.5556818%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#63F8FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="linearGradient-111"
          x1="49.9729611%"
          x2="49.9729611%"
          y1="0.091474553%"
          y2="100.000287%"
        >
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-112"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#6F6000" />
          <stop offset="51.08%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#FFDF63" />
        </linearGradient>
        <linearGradient
          id="linearGradient-113"
          x1="49.9979947%"
          x2="49.9979947%"
          y1="100.076384%"
          y2="0.084289157%"
        >
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-114"
          x1="49.9726318%"
          x2="49.9726318%"
          y1="95.9535637%"
          y2="3.90575356%"
        >
          <stop offset="0%" stopColor="#FFDF63" />
          <stop offset="48.92%" stopColor="#FF8D2C" />
          <stop offset="100%" stopColor="#6F6000" />
        </linearGradient>
        <linearGradient
          id="linearGradient-115"
          x1="50.0016207%"
          x2="50.0016207%"
          y1="14.7545338%"
          y2="141.35599%"
        >
          <stop offset="0%" stopColor="#FFC854" />
          <stop offset="100%" stopColor="#141B4B" />
        </linearGradient>
        <linearGradient
          id="linearGradient-116"
          x1="50.0016207%"
          x2="50.0016207%"
          y1="14.7545338%"
          y2="141.35599%"
        >
          <stop offset="0%" stopColor="#FFC854" />
          <stop offset="100%" stopColor="#141B4B" />
        </linearGradient>
        <linearGradient
          id="linearGradient-117"
          x1="50.0013492%"
          x2="50.0013492%"
          y1="112.288742%"
          y2="-28.3932419%"
        >
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-118"
          x1="49.9567478%"
          x2="49.9567478%"
          y1="86.8636204%"
          y2="-102.424956%"
        >
          <stop offset="0%" stopColor="#FFC900" />
          <stop offset="40.32%" stopColor="#FFFF1C" />
          <stop offset="100%" stopColor="#FFFF52" />
        </linearGradient>
        <linearGradient
          id="linearGradient-119"
          x1="50.0394933%"
          x2="50.0394933%"
          y1="119.089331%"
          y2="-5.85583094%"
        >
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-120"
          x1="49.9288086%"
          x2="49.9288086%"
          y1="91.9743649%"
          y2="-16.0441109%"
        >
          <stop offset="0%" stopColor="#FFC900" />
          <stop offset="100%" stopColor="#FFFF1C" />
        </linearGradient>
        <linearGradient
          id="linearGradient-121"
          x1="49.9782759%"
          x2="49.9782759%"
          y1="87.6294793%"
          y2="-146.0416%"
        >
          <stop offset="0%" stopColor="#FFC900" />
          <stop offset="40.32%" stopColor="#FFFF1C" />
          <stop offset="100%" stopColor="#FFFF52" />
        </linearGradient>
        <linearGradient
          id="linearGradient-122"
          x1="49.928062%"
          x2="49.928062%"
          y1="87.5324615%"
          y2="-146.197538%"
        >
          <stop offset="0%" stopColor="#00FFDB" />
          <stop offset="49.46%" stopColor="#0068DB" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-123"
          x1="50.0622711%"
          x2="50.0622711%"
          y1="87.7840278%"
          y2="-146.295139%"
        >
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-124"
          x1="49.9778084%"
          x2="49.9778084%"
          y1="87.5920064%"
          y2="-146.136131%"
        >
          <stop offset="0%" stopColor="#00FFDB" />
          <stop offset="49.46%" stopColor="#0068DB" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-125"
          x1="50.1803109%"
          x2="50.1803109%"
          y1="87.6295833%"
          y2="-146.025583%"
        >
          <stop offset="0%" stopColor="#00FFDB" />
          <stop offset="49.46%" stopColor="#0068DB" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-126"
          x1="49.9258984%"
          x2="49.9258984%"
          y1="163.705833%"
          y2="-7.43797619%"
        >
          <stop offset="0%" stopColor="#00FFDB" />
          <stop offset="49.46%" stopColor="#0068DB" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-127"
          x1="49.9155205%"
          x2="49.9155205%"
          y1="163.189058%"
          y2="-7.49630435%"
        >
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-128"
          x1="49.9871391%"
          x2="49.9871391%"
          y1="163.41324%"
          y2="-7.4444199%"
        >
          <stop offset="0%" stopColor="#00FFDB" />
          <stop offset="49.46%" stopColor="#0068DB" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-129"
          x1="54.9933407%"
          x2="30.787442%"
          y1="83.056285%"
          y2="-150.179263%"
        >
          <stop offset="0%" stopColor="#FFC900" />
          <stop offset="40.32%" stopColor="#FFFF1C" />
          <stop offset="100%" stopColor="#FFFF52" />
        </linearGradient>
        <linearGradient
          id="linearGradient-130"
          x1="49.5857143%"
          x2="49.5857143%"
          y1="48.1294118%"
          y2="166.8%"
        >
          <stop offset="0%" stopColor="#FFC900" />
          <stop offset="40.32%" stopColor="#FFFF1C" />
          <stop offset="100%" stopColor="#FFFF52" />
        </linearGradient>
        <linearGradient
          id="linearGradient-131"
          x1="49.9780714%"
          x2="49.9780714%"
          y1="49.158754%"
          y2="171.156773%"
        >
          <stop offset="0%" stopColor="#FFC900" />
          <stop offset="40.32%" stopColor="#FFFF1C" />
          <stop offset="100%" stopColor="#FFFF52" />
        </linearGradient>
        <linearGradient
          id="linearGradient-132"
          x1="49.9828129%"
          x2="49.9828129%"
          y1="85.7205532%"
          y2="207.569085%"
        >
          <stop offset="0%" stopColor="#FFC900" />
          <stop offset="40.32%" stopColor="#FFFF1C" />
          <stop offset="100%" stopColor="#FFFF52" />
        </linearGradient>
        <linearGradient
          id="linearGradient-133"
          x1="50.039816%"
          x2="50.039816%"
          y1="58.7465875%"
          y2="306.405045%"
        >
          <stop offset="0%" stopColor="#0068DB" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-134"
          x1="49.0284061%"
          x2="56.4936544%"
          y1="22.9587649%"
          y2="199.4287%"
        >
          <stop offset="0%" stopColor="#0068DB" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-135"
          x1="55.5381956%"
          x2="49.1254125%"
          y1="-106.150892%"
          y2="74.0043232%"
        >
          <stop offset="0%" stopColor="#0068DB" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-136"
          x1="117.003296%"
          x2="59.9302744%"
          y1="70.6750637%"
          y2="50.6135827%"
        >
          <stop offset="12.37%" stopColor="#FFFF00" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
        <linearGradient
          id="linearGradient-137"
          x1="51.4207724%"
          x2="37.9025052%"
          y1="55.1270921%"
          y2="18.3203003%"
        >
          <stop offset="0%" stopColor="#FFC900" />
          <stop offset="40.32%" stopColor="#FFFF1C" />
          <stop offset="100%" stopColor="#FFFF52" />
        </linearGradient>
        <linearGradient
          id="linearGradient-138"
          x1="100.011662%"
          x2="0.00385950471%"
          y1="49.9870732%"
          y2="49.9870732%"
        >
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-141"
          x1="50.5428084%"
          x2="42.2354428%"
          y1="48.3544659%"
          y2="28.217381%"
        >
          <stop offset="0%" stopColor="#FFC900" />
          <stop offset="40.32%" stopColor="#FFFF1C" />
          <stop offset="100%" stopColor="#FFFF52" />
        </linearGradient>
        <linearGradient
          id="linearGradient-142"
          x1="54.7225141%"
          x2="43.6315686%"
          y1="70.3109762%"
          y2="32.4982591%"
        >
          <stop offset="0%" stopColor="#FFC900" />
          <stop offset="40.32%" stopColor="#FFFF1C" />
          <stop offset="100%" stopColor="#FFFF52" />
        </linearGradient>
        <linearGradient
          id="linearGradient-143"
          x1="49.6303903%"
          x2="51.9721574%"
          y1="78.2702836%"
          y2="-112.65189%"
        >
          <stop offset="0%" stopColor="#FFC900" />
          <stop offset="40.32%" stopColor="#FFFF1C" />
          <stop offset="100%" stopColor="#FFFF52" />
        </linearGradient>
        <linearGradient
          id="linearGradient-144"
          x1="53.0643871%"
          x2="45.1415192%"
          y1="58.1394898%"
          y2="40.8770728%"
        >
          <stop offset="0%" stopColor="#FFC900" />
          <stop offset="40.32%" stopColor="#FFFF1C" />
          <stop offset="100%" stopColor="#FFFF52" />
        </linearGradient>
        <linearGradient
          id="linearGradient-145"
          x1="53.4902423%"
          x2="93.290966%"
          y1="56.71404%"
          y2="281.38433%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#444F90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-146"
          x1="47.8477168%"
          x2="61.3483259%"
          y1="22.2873327%"
          y2="212.216208%"
        >
          <stop offset="0%" stopColor="#0068DB" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-147"
          x1="31.053132%"
          x2="53.1594754%"
          y1="-98.9976624%"
          y2="72.4563306%"
        >
          <stop offset="0%" stopColor="#0068DB" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-148"
          x1="49.651141%"
          x2="39.9530406%"
          y1="57.2411188%"
          y2="-18.155253%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#444F90" />
        </linearGradient>
        <linearGradient
          id="linearGradient-149"
          x1="41.4398067%"
          x2="61.6336244%"
          y1="17.9319086%"
          y2="114.966463%"
        >
          <stop offset="0%" stopColor="#0068DB" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-150"
          x1="28.9548526%"
          x2="55.0307088%"
          y1="4.35194443%"
          y2="54.3537253%"
        >
          <stop offset="0%" stopColor="#0068DB" />
          <stop offset="100%" stopColor="#000E67" />
        </linearGradient>
        <linearGradient
          id="linearGradient-151"
          x1="48.534245%"
          x2="53.9190061%"
          y1="8.53408789%"
          y2="111.073458%"
        >
          <stop offset="0%" stopColor="#FFEB00" />
          <stop offset="100%" stopColor="#FFA800" />
        </linearGradient>
        <linearGradient
          id="linearGradient-152"
          x1="48.9813811%"
          x2="53.2145156%"
          y1="13.0383147%"
          y2="107.240064%"
        >
          <stop offset="0%" stopColor="#FFEB00" />
          <stop offset="100%" stopColor="#FFA800" />
        </linearGradient>
        <linearGradient
          id="linearGradient-153"
          x1="49.0661969%"
          x2="53.6475989%"
          y1="14.4039945%"
          y2="105.87042%"
        >
          <stop offset="0%" stopColor="#FFEB00" />
          <stop offset="100%" stopColor="#FFA800" />
        </linearGradient>
        <linearGradient
          id="linearGradient-154"
          x1="49.0329512%"
          x2="53.803228%"
          y1="14.2096652%"
          y2="107.50713%"
        >
          <stop offset="0%" stopColor="#FFEB00" />
          <stop offset="100%" stopColor="#FFA800" />
        </linearGradient>
        <linearGradient
          id="linearGradient-155"
          x1="49.1514488%"
          x2="53.6723651%"
          y1="12.4422818%"
          y2="106.64466%"
        >
          <stop offset="0%" stopColor="#FFEB00" />
          <stop offset="100%" stopColor="#FFA800" />
        </linearGradient>
        <linearGradient
          id="linearGradient-156"
          x1="48.7850745%"
          x2="53.3578187%"
          y1="2.01659991%"
          y2="113.118099%"
        >
          <stop offset="0%" stopColor="#FFEB00" />
          <stop offset="100%" stopColor="#FFA800" />
        </linearGradient>
        <linearGradient
          id="linearGradient-157"
          x1="48.7649374%"
          x2="51.4311268%"
          y1="-11.7056614%"
          y2="124.301355%"
        >
          <stop offset="0%" stopColor="#FFEB00" />
          <stop offset="100%" stopColor="#FFA800" />
        </linearGradient>
        <linearGradient
          id="linearGradient-158"
          x1="-12.25897%"
          x2="40.4338862%"
          y1="82.7085779%"
          y2="52.2139153%"
        >
          <stop offset="12.37%" stopColor="#FFFF00" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
        <path
          id="path-139"
          d="M274.779661,205.057602 L274.779661,269.5362 C274.779661,270.64077 275.675092,271.5362 276.779661,271.5362 C277.129899,271.5362 277.473996,271.444227 277.777526,271.269482 L334.196299,238.788726 C335.153564,238.23762 335.482821,237.014844 334.931716,236.057579 C334.753536,235.748082 334.495735,235.491939 334.185094,235.31576 L277.766321,203.317918 C276.80552,202.773 275.584894,203.110141 275.039977,204.070942 C274.869352,204.371788 274.779661,204.71174 274.779661,205.057602 Z"
        />
      </defs>
      <g
        id="GraphicalDesign"
        fill="none"
        fillRule="evenodd"
        stroke="none"
        strokeWidth="1"
      >
        <g id="Login-Students" transform="translate(-134.000000, -824.000000)">
          <g id="Overview" transform="translate(-0.000000, 398.000000)">
            <g id="Symbiosis" transform="translate(134.000000, 430.000000)">
              <text
                className="text-white text-center font-bold text-5xl z-50"
              >
                <tspan x="203.375347" y="458.933744">
                  Symbiosis
                </tspan>
              </text>
              <g
                className="hover"
                id="HOVER"
                fill="#FFFFFF"
                fillOpacity="0"
                stroke="#FFFFFF"
                strokeWidth="14"
                transform="translate(140.958398, 83.861325)"
              >
                <circle cx="157.016949" cy="157.016949" r="150.016949" />
              </g>
              <g
                id="Group"
                fillRule="nonzero"
                transform="translate(155.232666, 119.546995)"
              >
                <g id="Symbiosis">
                  <g id="Clownfish" transform="translate(10.705701, 0.740184)">
                    <path
                      id="Path"
                      d="M62.1524142,107.693307 C60.2764032,105.841392 60.1660496,101.756284 61.8765302,98.6516027 C64.6905467,94.4030908 66.1803201,90.2635152 68.3873918,85.9060672 C72.3049441,84.217556 76.7742644,83.6184069 81.0228775,84.2720241 L107.949153,96.5818149 C103.535009,102.192029 98.1276834,107.094158 92.1685897,111.07033 C81.9057062,114.719692 70.3737564,114.610756 62.1524142,107.693307 Z"
                      fill="url(#linearGradient-2)"
                    />
                    <path
                      id="Path"
                      d="M60.1136067,94.4189479 C60.668261,92.8162553 61.8885004,91.3240932 62.8314126,89.6661353 C64.6063062,88.0634426 66.7139924,86.7370763 68.877144,85.7975668 C66.658527,90.2740532 65.1054951,94.4189479 62.3322238,98.7296385 C60.6127956,101.879758 60.7237264,106.024653 62.6095509,107.903672 C70.9293648,114.922361 82.5216389,115.032891 92.7827427,111.330119 C89.7876097,113.374933 86.570615,115.143422 83.2981548,116.690849 C78.3617319,117.298767 73.3698436,117.077706 68.6552823,115.972401 C64.7727025,115.198687 60.7791918,113.153872 59.0597636,109.616895 C56.7856812,104.864083 58.6160402,99.2270258 60.1136067,94.4189479 Z"
                      fill="url(#linearGradient-3)"
                    />
                    <path
                      id="Path"
                      d="M62.1498187,89.8621175 C62.3150518,89.6967896 62.4802848,89.5314617 62.7005955,89.3661339 C61.7642749,91.0745218 60.6076435,92.5624727 60.001789,94.1055328 C58.5146915,98.8449316 56.697128,104.521188 58.9002353,109.205478 C60.5525659,112.732473 64.5732368,114.771516 68.4286747,115.543046 C73.1102779,116.645232 78.0672695,116.865669 82.9691834,116.259467 C80.8211537,117.251434 78.673124,118.133183 76.4700166,118.904713 C71.2376366,120.72332 64.9587806,121.715287 60.4974882,118.463839 C57.4682155,116.259467 55.9260404,112.512035 55.4854189,108.819713 C54.604176,101.875943 57.1377494,94.6566257 62.1498187,89.8621175 Z"
                      fill="url(#linearGradient-4)"
                    />
                    <path
                      id="Path"
                      d="M116.750859,8.44711773 C131.05705,0.884345033 149.214908,2.76123753 163.356028,11.4832673 C166.657456,15.0714442 169.133528,19.4876618 170.399076,24.4007039 L127.150359,27.0504345 C125.609692,28.4857052 123.463764,28.927327 121.427883,28.5961107 C114.659954,22.6894196 109.652787,12.0352946 116.750859,8.44711773 Z"
                      fill="url(#linearGradient-5)"
                    />
                    <path
                      id="Path"
                      d="M112.447933,5.65068495 C114.354139,3.13814648 117.512995,2.31884045 120.453999,1.71801604 C130.093955,-0.24831842 140.224079,-0.794522436 149.646184,2.64656286 C154.711245,4.50365652 159.503992,7.61701941 163.261941,11.8227903 C149.264942,3.19276688 131.346605,1.33567323 117.131754,8.81866824 C110.106023,12.3689943 115.116622,22.9107319 121.706648,28.7004944 C120.562925,28.5366332 119.473664,28.09967 118.438866,27.4442252 C115.661252,25.6963723 113.700583,22.6376298 112.339007,19.4696466 C110.487264,14.9907736 109.615855,9.31025186 112.447933,5.65068495 Z"
                      fill="url(#linearGradient-6)"
                    />
                    <path
                      id="Path"
                      d="M40.3927173,28.8151137 C44.2527657,24.5074894 50.9942589,23.9552299 56.9202488,24.3418115 C68.3916605,25.1702008 79.536871,28.6494358 89.2141757,34.3377089 C76.818527,29.0912434 63.17244,27.2135611 50.015655,29.643503 C46.3730741,30.0853106 41.6431555,31.907767 41.3169542,35.7183577 C41.0451198,48.3098749 51.9728627,55.4892487 62.8462388,58.9684837 C58.1163202,59.2998394 53.2776679,58.3609982 49.2001518,56.1519601 C42.8392269,52.7279511 38.3811427,46.3217406 37.6200064,39.4184965 C37.1307044,35.7735837 37.783107,31.6868632 40.3927173,28.8151137 Z"
                      fill="url(#linearGradient-7)"
                    />
                    <path
                      id="Path"
                      d="M52.5889385,50.3822666 C51.1218964,48.4898513 50.1438683,47.0299881 48.7311612,45.5160558 C46.3404259,42.5422604 45.6884072,37.2975666 47.2097842,36.3243244 C60.9021769,29.4034914 76.876635,30.3226645 91.7100604,35.5132893 C92.9597629,36.3243244 94.2094654,37.1353596 95.459168,38.0004637 L70.5194527,56.3839265 C69.6500944,56.7083405 68.7807362,57.0327546 67.9113779,57.2490306 C62.4235538,56.0595124 57.0987345,54.3293042 52.5889385,50.3822666 Z"
                      fill="url(#linearGradient-8)"
                    />
                    <path
                      id="Path"
                      d="M41.0435098,35.821158 C41.4274684,32.0258054 46.1446743,30.2106368 49.8197067,29.7705959 C63.0937047,27.295366 76.8613636,29.2205448 89.3674443,34.4460302 C90.1902128,34.9410762 91.0678325,35.4361222 91.8906009,35.9861733 C76.9162149,30.7056828 60.7899529,29.7705959 46.9674427,36.8112499 C45.4316083,37.856347 46.089823,43.1368375 48.5032772,46.1621185 C49.9294092,47.6472565 50.9167314,49.1873996 52.3977146,51.1125784 C56.9503668,55.1279514 62.3257874,56.8881149 67.8657617,58.1532324 C66.1653736,58.5932733 64.4649854,58.9233039 62.709746,59.0333141 C51.8492023,55.5129871 40.7692536,48.3073178 41.0435098,35.821158 Z"
                      fill="url(#linearGradient-9)"
                    />
                    <path
                      id="Path"
                      d="M117.551535,34.8613663 C116.071328,31.2826832 115.413458,26.9882636 116.564731,23.1342972 C119.086565,22.4736172 121.663222,21.9230506 124.185056,21.372484 C124.897749,21.207314 125.610441,21.0972007 126.377956,20.9870873 C131.31198,20.1061807 136.246003,19.5005574 141.23485,19.1702175 C152.692749,18.3994242 166.398371,19.0050475 177.965916,23.4646371 C195.185486,29.7530458 203.513194,44.9367355 209.653313,61.0683377 C205.543134,64.4447268 188.016393,82.6230211 137.452098,80.2280562 C135.533311,63.3256608 123.582009,50.8828551 117.551535,34.8613663 Z"
                      fill="url(#linearGradient-10)"
                    />
                    <path
                      id="Path"
                      d="M137.919268,111.248162 C138.421806,110.478193 138.980181,109.708224 139.538556,108.993253 C139.538556,112.073129 140.376118,115.153006 142.162918,117.902896 C146.071542,124.007652 152.437017,121.752743 157.909091,119.497833 C157.406553,120.377797 156.792341,121.202765 156.122291,121.972734 C154.838029,123.512672 153.218741,124.777622 151.431942,125.712584 C146.685755,126.537551 141.939568,125.217604 139.147693,120.762782 C137.249218,118.122888 136.970031,114.603028 137.919268,111.248162 Z"
                      fill="url(#linearGradient-11)"
                    />
                    <path
                      id="Path"
                      d="M142.620877,117.508917 C140.935914,114.717932 140.120609,111.592029 140.066256,108.466126 C140.609792,107.74047 141.207682,107.070634 141.805572,106.456617 C145.50162,102.660878 149.958619,100.48391 154.74174,98.3069415 C156.046228,97.7487445 157.405069,97.1905476 158.818264,97.4696461 C160.448873,97.8045642 161.5903,99.3675157 162.079482,100.986287 C162.949141,104.11219 161.644653,107.461372 161.046763,110.531455 C160.448873,113.545718 159.524861,116.504162 158.002959,119.127688 C152.621948,121.416295 146.425632,123.649083 142.620877,117.508917 Z"
                      fill="url(#linearGradient-12)"
                    />
                    <path
                      id="Path"
                      d="M190.946022,31.3769197 C191.049352,31.4875158 191.204346,31.5981119 191.307675,31.7087079 C191.565998,31.9851982 191.824321,32.2616884 192.082644,32.5381786 C192.289302,32.7593708 192.495961,32.9805629 192.702619,33.2017551 C185.056256,44.3719597 187.019512,57.8093841 192.495961,70.1961457 C191.565998,70.6385301 190.687699,71.0809144 189.757736,71.5232987 C184.746268,58.0305763 183.19633,43.8189793 190.946022,31.3769197 Z"
                      fill="url(#linearGradient-13)"
                    />
                    <path
                      id="Path"
                      d="M202.516179,86.3150091 C201.434795,87.3855792 200.299342,88.4026208 199.109819,89.3661339 C195.70346,83.8526978 192.459308,77.9645622 190.026194,71.9158411 C190.945371,71.4876131 191.918616,71.059385 192.891862,70.631157 C195.541252,76.144593 198.947612,81.4974436 202.516179,86.3150091 Z"
                      fill="#000000"
                    />
                    <path
                      id="Path"
                      d="M208.566948,77.4709104 C207.02992,80.5729981 204.943953,83.3485503 202.473729,85.7975668 C198.850733,80.8995337 195.392419,75.5116972 192.702619,69.8517477 C198.301794,67.293886 204.010757,64.3550661 209.225675,60.8175977 C210.927385,66.3142793 211.256748,72.0286514 208.566948,77.4709104 Z"
                      fill="url(#linearGradient-14)"
                    />
                    <path
                      id="Path"
                      d="M192.6486,34.053345 C197.368444,38.9741268 201.003266,44.9337405 204.20408,50.9480294 C205.994366,54.283226 207.676149,57.8917994 208.761171,61.5550482 C203.553067,65.1089462 197.965206,68.0614153 192.431595,70.631157 C186.680981,58.3292023 184.619439,45.0977665 192.6486,34.053345 Z"
                      fill="url(#linearGradient-15)"
                    />
                    <path
                      id="Path"
                      d="M189.820315,71.5232987 C192.265127,77.7462628 195.524876,83.8040155 198.947612,89.4762748 C196.937433,91.0733187 194.818597,92.5602216 192.645431,93.8268426 C187.864466,88.3748652 184.44173,81.6562668 181.996918,74.6072455 C184.061426,73.8913293 186.071604,73.1203426 188.081783,72.2942854 C188.625074,72.0740035 189.222695,71.7986511 189.820315,71.5232987 Z"
                      fill="url(#linearGradient-16)"
                    />
                    <path
                      id="Path"
                      d="M181.698672,25.1319274 C184.933642,26.7182887 187.952947,28.7422669 190.594839,31.14916 C190.702671,31.2585642 190.810504,31.3132663 190.918336,31.4226705 C182.884828,43.7306463 184.448396,57.7890897 189.678264,71.1364056 C189.085186,71.4099162 188.492109,71.6834267 187.952947,71.9022352 C185.958049,72.7227669 183.909235,73.4885965 181.914337,74.199724 C180.512517,70.2064697 179.434193,66.1038111 178.571535,62.0558546 C175.983559,50.0760916 175.1209,35.962946 181.698672,25.1319274 Z"
                      fill="url(#linearGradient-17)"
                    />
                    <path
                      id="Path"
                      d="M192.702619,93.3000994 C192.260235,93.5729619 191.817851,93.7912519 191.375466,94.0095419 C190.877784,94.2824044 190.4354,94.5006944 189.937717,94.7189844 C185.679768,88.6068643 182.030097,82.0035917 179.320493,75.0183115 C180.149964,74.745449 180.979434,74.4725865 181.864203,74.199724 C184.352615,81.2395766 187.836392,87.8974218 192.702619,93.3000994 Z"
                      fill="#000000"
                    />
                    <path
                      id="Path"
                      d="M179.343885,24.2397856 C179.516909,24.2944653 179.747607,24.4038246 179.920631,24.4585043 C180.555052,24.7319025 181.189473,25.0053008 181.823894,25.2786991 C174.787588,36.105271 175.768057,50.1579426 178.42109,62.1327873 C179.343885,66.1790818 180.497378,70.280056 181.996918,74.2716709 C181.131799,74.5450692 180.266679,74.8184675 179.343885,75.0918658 C172.884324,59.1254062 171.500133,41.4091976 179.343885,24.2397856 Z"
                      fill="url(#linearGradient-18)"
                    />
                    <path
                      id="Path"
                      d="M179.535467,75.0918658 C182.212788,82.0579574 185.818975,88.6430909 190.026194,94.738421 C189.916916,94.7928436 189.807637,94.8472662 189.698359,94.9016888 C189.64372,94.9016888 189.589081,94.9561114 189.589081,94.9561114 C185.818975,96.7520569 181.994231,98.330312 178.060208,99.6908768 C177.404538,99.9085672 176.748868,100.126258 176.038558,100.39837 C165.165356,103.990261 153.800402,106.003897 142.162251,106.27601 C139.976683,106.330433 137.791115,106.330433 135.605547,106.27601 C139.321013,98.4935798 138.282868,89.3505846 137.572558,80.7518152 C137.517919,80.4252797 137.517919,80.1531667 137.46328,79.8266312 C151.833391,80.6973926 166.094223,79.2279827 179.535467,75.0918658 Z"
                      fill="url(#linearGradient-19)"
                    />
                    <path
                      id="Path"
                      d="M137.553846,80.8554996 C138.297748,89.4330897 139.384991,98.5535653 135.493807,106.316827 C135.264914,106.316827 135.093245,106.316827 134.864351,106.316827 C134.120449,106.316827 133.433769,106.262539 132.689867,106.262539 C132.174857,106.262539 131.659848,106.20825 131.144838,106.20825 C133.719886,97.5763715 134.063225,88.5101845 132.632643,79.5525745 C134.234895,79.7154402 135.837147,79.8240173 137.439399,79.9325944 C137.439399,80.2040371 137.496622,80.5297684 137.553846,80.8554996 Z"
                      fill="#000000"
                    />
                    <path
                      id="Path"
                      d="M113.74376,24.0654988 C114.623614,23.8446203 115.503467,23.5685223 116.383321,23.3476439 C115.228513,27.2682359 115.943394,31.5201455 117.373157,35.1094199 C123.367161,51.1231056 135.355169,63.6579561 137.389831,80.4447163 C135.850086,80.3342771 134.310342,80.2238379 132.770598,80.0581791 C132.055717,75.3645126 130.9559,70.7260657 129.416155,66.1428384 C124.521969,51.9513997 110.664272,39.582208 113.74376,24.0654988 Z"
                      fill="url(#linearGradient-20)"
                    />
                    <path
                      id="Path"
                      d="M133.053183,80.0399189 C134.376977,89.2073898 134.046029,98.4304211 131.619073,107.208969 C122.187038,106.708925 112.755004,105.319914 103.488444,103.319739 C104.260657,101.486245 104.812238,99.5971901 104.75708,97.5414542 C104.75708,90.3741588 104.75708,83.0957425 104.315815,75.9840075 C111.982791,76.7618535 119.649766,78.0397434 127.316741,79.3176333 C129.192116,79.6509959 131.12265,79.8732376 133.053183,80.0399189 Z"
                      fill="url(#linearGradient-21)"
                    />
                    <path
                      id="Path"
                      d="M93.4529812,39.250926 C92.2574206,37.238563 90.8444855,35.2262 89.2141757,33.3770015 C96.8766318,29.6242164 104.919493,26.5240896 113.125386,24.2397856 C110.082141,39.5228669 123.831087,51.7058214 128.667673,65.7379744 C130.189296,70.2521941 131.330512,74.8751902 132.03698,79.5525745 C130.134952,79.38941 128.232924,79.1718572 126.330896,78.8999163 C118.777127,77.5945997 111.169014,76.3980595 103.669589,75.6366249 C102.800091,62.6922357 100.40897,50.1829521 93.4529812,39.250926 Z"
                      fill="url(#linearGradient-22)"
                    />
                    <path
                      id="Path"
                      d="M104.376843,97.1364008 C104.431196,99.1329277 103.887664,100.967574 103.126718,102.74826 C102.583186,102.64034 102.039653,102.532419 101.441768,102.370539 C101.333061,102.370539 101.224355,102.316579 101.115648,102.316579 C100.735175,102.208658 100.354703,102.154698 99.9198767,102.046778 C101.496121,93.5750284 102.14836,84.6715976 101.604827,75.9840075 C102.365773,76.0379677 103.126718,76.1458881 103.833311,76.1998483 C104.376843,83.1067522 104.376843,90.1755367 104.376843,97.1364008 Z"
                      fill="#000000"
                    />
                    <path
                      id="Path"
                      d="M87.4298921,34.3185763 C88.2028879,33.9327853 88.9206697,33.5469942 89.6936655,33.1612032 C91.3500851,34.9799323 92.7856487,37.0742265 94.0003563,39.1134077 C101.067746,50.1911215 103.497162,62.8671125 104.380586,75.9840075 C103.60759,75.9288945 102.834594,75.8186685 102.116812,75.7635555 C101.178174,60.7177053 96.8162696,46.0576462 87.4298921,34.3185763 Z"
                      fill="url(#linearGradient-23)"
                    />
                    <path
                      id="Path"
                      d="M68.7785875,60.2625134 C65.6816277,56.7929423 61.4436827,55.8171254 57.0970724,55.0581568 C58.3467229,54.4076122 59.5420407,53.7028555 60.6286933,52.9438869 C67.0399434,48.4984989 73.1251978,43.077294 79.6994458,39.1198145 C79.8624437,39.0113904 80.0797742,38.9029663 80.2427721,38.7945422 C80.6774331,38.577694 81.0577615,38.3066337 81.4924225,38.0897855 C81.9270835,37.8729373 82.3074119,37.6018771 82.742073,37.3850289 C84.2090539,36.5718482 85.7303675,35.7586674 87.2516811,34.9454867 C96.4882279,46.4926531 100.780506,60.858846 101.70416,75.7129473 C92.5219461,74.8455545 83.3397319,74.7371304 74.266183,75.9840075 C74.7551766,70.3459545 73.233863,64.7621135 68.7785875,60.2625134 Z"
                      fill="url(#linearGradient-24)"
                    />
                    <path
                      id="Path"
                      d="M101.521955,75.7220455 C102.066158,84.4334032 101.358694,93.3070842 99.8349253,101.856118 C99.6716643,101.802011 99.5084034,101.802011 99.3451424,101.747903 C95.5901403,100.882178 91.8351383,99.9082372 88.1345565,98.826081 C84.1618731,97.689817 79.5905663,96.0124748 74.8559984,94.6597795 C74.1485343,94.4433483 73.4954904,94.2810248 72.7880263,94.0645936 C70.8288948,93.5235155 68.8697633,93.090653 66.9106317,92.8201139 C70.8833151,88.0045187 73.6043311,81.9985516 74.094114,76.0466924 C83.1278871,74.7481049 92.2705008,74.9104283 101.521955,75.7220455 Z"
                      fill="url(#linearGradient-25)"
                    />
                    <path
                      id="Path"
                      d="M66.9928568,92.9347009 C65.4429147,92.6621817 63.9464188,92.4986702 62.449923,92.4441664 C66.2980551,87.7568364 69.0772617,82.3064526 69.9858485,76.6925574 C71.3220055,76.4200382 72.7116088,76.2020229 74.0477658,75.9840075 C73.5667493,82.0339334 70.8944353,88.0838594 66.9928568,92.9347009 Z"
                      fill="#000000"
                    />
                    <path
                      id="Path"
                      d="M69.0423105,66.1436169 C66.8807161,59.2121897 59.6199761,57.7029273 52.6363636,56.3054622 C53.91115,55.8023747 55.1859365,55.18749 56.4052974,54.5726054 C60.8393371,55.3551858 65.1625257,56.3613608 68.321779,59.9388716 C72.8666697,64.5784559 74.4185836,70.3360123 73.9751796,76.1494674 C72.5341167,76.3730618 71.1484793,76.5966562 69.7628419,76.8761493 C70.2616714,73.2427399 70.0953949,69.6652291 69.0423105,66.1436169 Z"
                      fill="url(#linearGradient-26)"
                    />
                    <path
                      id="Path"
                      d="M69.587057,75.9840075 C68.6655536,81.7443138 65.9010435,87.3368443 61.9439995,92.1464204 C57.7159252,91.9786445 53.6504691,92.7056735 49.9644555,94.7189844 C49.9644555,90.9160637 49.2055704,87.0572177 48.1756549,83.1983718 C51.6448441,81.6883885 55.1140333,80.1784053 58.6374286,78.8921233 C62.269236,77.6617666 65.9010435,76.7110365 69.587057,75.9840075 Z"
                      fill="url(#linearGradient-27)"
                    />
                    <path
                      id="Path"
                      d="M37.4699538,58.137575 C42.5772606,59.1628186 48.0731668,58.2454954 53.0694452,56.3568889 C60.0642349,57.7058935 67.3365957,59.1628186 69.5016496,65.8538818 C70.5564195,69.2533735 70.7229621,72.7068255 70.1678201,76.1063173 C66.3928542,76.8077997 62.6734025,77.7251229 58.9539508,78.9662072 C55.3455275,80.2072915 51.7926185,81.6642165 48.2397094,83.1211416 C47.573539,80.8548137 46.8518543,78.5884859 46.0746554,76.322158 C43.9096015,70.0088162 41.5224907,63.3717132 37.4699538,58.137575 Z"
                      fill="url(#linearGradient-28)"
                    />
                    <path
                      id="Path"
                      d="M49.9599384,95.5399048 C49.0677966,96.0459516 48.1756549,96.6644532 47.2835131,97.3954097 C47.4409499,93.1221256 47.1260763,88.905069 46.3913713,84.8004672 C47.0211185,84.5193301 47.5983867,84.2944204 48.2281338,84.0132833 C49.2252334,87.836748 49.9599384,91.7164401 49.9599384,95.5399048 Z"
                      fill="#000000"
                    />
                    <path
                      id="Path"
                      d="M37.5701581,58.779424 C41.5815636,64.0811439 43.9444463,70.8039433 46.0325752,77.2534582 C46.8018858,79.4943914 47.5162457,81.7899814 48.1756549,84.1402284 C47.5162457,84.4135129 46.9117874,84.6867975 46.2523782,84.9054251 C44.3291016,74.7938975 39.658287,65.2835958 33.009245,57.2490306 C34.4929155,57.9049135 36.0315368,58.4514826 37.5701581,58.779424 Z"
                      fill="url(#linearGradient-29)"
                    />
                    <path
                      id="Path"
                      d="M46.3050064,84.0132833 C47.0765822,88.0849083 47.4072576,92.2115552 47.2419199,96.338202 C46.0294436,97.2735753 44.8720798,98.3189926 43.8249412,99.5844976 C41.0693132,102.720749 38.5341354,106.297177 35.447832,108.993253 C30.432589,108.388011 25.6929089,106.132111 22.6066055,102.445639 C19.4651896,98.7041463 16.9300118,94.2473676 15.1664099,89.5705011 C26.0235842,91.7163575 36.1642953,88.1399302 46.3050064,84.0132833 Z"
                      fill="url(#linearGradient-30)"
                    />
                    <path
                      id="Path"
                      d="M22.425078,52.8758642 C23.6893549,51.824493 25.2834433,51.7138223 26.9325001,52.1011696 C27.6470915,52.7651935 28.3067142,53.3738821 29.0213055,54.037906 C29.0213055,54.2592474 29.0213055,54.4252533 28.8563998,54.5912593 C28.966337,54.4252533 29.0213055,54.2592474 29.0213055,54.037906 C29.461054,54.4252533 29.9557711,54.8126006 30.4504882,55.1999479 C31.3299852,55.8639718 32.2094822,56.4173251 33.1439477,56.915343 C39.7951438,65.0496361 44.4674716,74.7333182 46.3913713,84.9150183 C36.2771558,89.0651679 26.1629403,92.6619641 15.2791649,90.5038863 C10.3869628,77.5554199 11.4313655,62.4488757 22.425078,52.8758642 Z"
                      fill="url(#linearGradient-31)"
                    />
                    <path
                      id="Path"
                      d="M0.060648947,81.6613397 C-0.383188688,73.084899 1.61408067,64.3977946 5.88601791,56.9833233 C6.94013229,55.1020395 8.16068579,53.3314195 9.54767839,51.6714633 C11.5449478,49.2368607 14.0415344,46.912922 17.1483979,46.5809307 C19.3675861,46.3596032 21.3648554,47.1342495 23.1956857,48.4068826 C21.9196525,48.2962189 20.6436193,48.240887 19.3121064,48.7942057 C14.87373,50.1775026 11.1011101,53.552747 9.49219869,57.536642 C5.94149761,66.9983927 4.88738323,77.5667809 7.27301052,87.5818504 C4.554505,86.0325578 2.0024386,84.0959422 0.060648947,81.6613397 Z"
                      fill="url(#linearGradient-32)"
                    />
                    <path
                      id="Path"
                      d="M7.11386079,87.0901502 C7.928425,90.432539 9.12311918,93.7201346 10.7522476,96.8981436 C13.8475916,103.528128 18.0833255,110.377285 24.9799692,113.445708 C21.5587995,113.555294 18.0290212,112.569016 15.0422858,110.760838 C10.7522476,108.185555 7.54829504,104.130854 5.1046024,99.747393 C2.00925839,94.1036874 0.325825685,87.7476693 0,81.3368581 C1.95495411,83.8025547 4.45295103,85.7203188 7.11386079,87.0901502 Z"
                      fill="url(#linearGradient-33)"
                    />
                    <path
                      id="Path"
                      d="M15.3648553,90.1970684 C17.1318827,94.982361 19.6719846,99.4337959 22.8195021,103.217516 C25.9118,106.945592 30.7159057,109.226953 35.6856703,109.839025 C33.9186429,111.397027 32.0411763,112.732458 29.7771724,113.511459 C28.3414627,114.012245 26.7953137,114.29046 25.3043844,114.346103 C18.2914944,111.174456 13.9843652,104.219089 10.8368476,97.5419361 C9.18025947,94.3146457 7.96542814,90.9760695 7.13713405,87.5818504 C8.84894183,88.4721373 10.6711888,89.0842097 12.5486554,89.5293531 C13.5426083,89.8075678 14.4813416,90.0301396 15.3648553,90.1970684 Z"
                      fill="#000000"
                    />
                    <path
                      id="Path"
                      d="M8.88098515,57.3448214 C10.5016563,53.4305013 14.3018506,50.1142024 18.7726675,48.7550635 C20.0580274,48.2114079 21.3992724,48.3201391 22.6846323,48.3745046 C24.0817626,49.2987191 25.4230076,50.4947613 26.7642527,51.6908035 C25.0876964,51.3102446 23.4670252,51.3646102 22.1816654,52.4519213 C11.0046232,61.8571625 9.99868937,76.6989593 14.9165879,89.3661339 C13.9665394,89.2030372 13.072376,88.985575 12.1223274,88.7137472 C10.2781154,88.2788227 8.43390346,87.6264361 6.6455767,86.8109527 C4.24251263,77.0795182 5.30433164,66.6413314 8.88098515,57.3448214 Z"
                      fill="url(#linearGradient-34)"
                    />
                    <path
                      id="Path"
                      d="M140.131139,38.5140537 C141.496954,38.5691788 142.917401,38.7345539 144.228583,39.0653043 C153.46149,41.2703063 164.8797,48.1058127 167.228902,57.973197 C170.179061,70.1558334 159.416442,82.503845 148.052864,85.2600976 C144.938807,85.9767233 141.660852,85.9767233 138.546794,85.2600976 C135.268839,81.1808438 132.974271,76.3298392 131.553823,71.1480844 C129.095357,60.3435742 129.204622,44.3021842 140.131139,38.5140537 Z"
                      fill="url(#linearGradient-35)"
                    />
                    <path
                      id="Path"
                      d="M127.247309,48.3755795 C128.090203,45.422568 130.000765,42.1414441 132.641835,39.7352866 C135.282906,38.8056349 138.148748,38.4228371 140.958398,38.5322079 C129.7198,44.2194892 129.607414,60.1876253 132.136098,70.9059633 C133.597116,76.0463907 135.957222,80.8587057 139.328801,84.9054251 C137.081081,84.4132565 134.945748,83.5929755 133.035186,82.4992676 C132.304677,81.6243012 131.686555,80.6946495 131.124625,79.7103123 C126.123449,70.0309969 124.212887,58.218951 127.247309,48.3755795 Z"
                      fill="url(#linearGradient-36)"
                    />
                    <path
                      id="Path"
                      d="M124.987517,45.2108211 C126.770326,42.4727902 129.471552,40.5561685 132.496926,39.4061955 C129.957773,41.7609021 128.120939,45.1012999 127.310571,48.0583734 C124.393247,57.9152848 126.230081,69.688818 131.092288,79.4362082 C131.632533,80.4218994 132.226803,81.3528299 132.929122,82.2289998 C130.768141,80.9147449 128.823258,79.1624051 127.364596,77.0815016 C124.55532,73.0292158 123.528855,68.0459994 122.826536,63.1723043 C121.908119,57.0391149 121.637996,50.3583194 124.987517,45.2108211 Z"
                      fill="url(#linearGradient-37)"
                    />
                    <circle
                      id="Oval"
                      cx="196.717257"
                      cy="53.2343927"
                      fill="#000000"
                      r="5.79892142"
                    />
                    <circle
                      id="Oval"
                      cx="193.594761"
                      cy="51.8961801"
                      fill="#FFFFFF"
                      r="1.78428351"
                    />
                  </g>
                  <g id="SeaAnemone" transform="translate(0.000000, 99.027735)">
                    <path
                      id="Path"
                      d="M73.7698588,8.5399766 C68.3597087,16.3897609 65.5701,26.2230929 63.6680941,35.4655809 C61.6392878,45.1723035 60.7094183,55.0900417 61.174353,65.00778 C61.6392878,75.0099246 64.3443629,84.8432566 64.4288965,94.8454011 C64.4711633,98.4326681 64.0484953,101.893326 62.653691,105.142968 C61.0052858,108.983454 57.8775428,111.642251 56.3136713,115.482737 C55.0034005,118.690176 58.3002108,122.319646 61.4702206,122.23524 C71.022517,121.939818 76.0522659,109.86972 77.2357363,101.893326 C78.8418746,91.1315246 75.8409319,80.7495518 74.7419952,70.1143601 C73.7698588,60.6186533 73.8966592,50.8275244 75.2914636,41.3318176 C76.7708015,31.3718762 80.2366789,22.0027788 82.5613528,12.2960562 C83.8716235,6.80964779 76.8553351,4.10864673 73.7698588,8.5399766 L73.7698588,8.5399766 Z"
                      fill="url(#linearGradient-38)"
                    />
                    <path
                      id="Path"
                      d="M49.0015152,3.72881846 C45.4511042,6.5142258 43.9294995,13.2667285 43.2109639,17.613652 C42.4501615,22.2137945 42.2388275,26.8139369 42.5769619,31.4562825 C43.3377643,41.2474113 46.0005726,50.5743056 49.255116,59.7745905 C52.5519262,69.2280942 56.3559381,78.7660042 57.835276,88.7259456 C58.3847444,92.3976189 58.5960784,96.4069173 58.04661,99.9941844 C57.3280744,104.509921 54.1580646,108.983454 55.0034005,113.541393 C55.3838017,115.65155 57.9198096,117.550691 60.0754163,117.424082 C65.781434,117.00205 69.0782443,111.22022 70.4730486,106.198046 C71.7410525,101.640107 72.0791869,96.7023393 71.6987857,91.9755875 C70.9379834,81.6358178 67.8102403,71.8446889 64.4288965,62.1379664 C61.2588866,53.064291 57.7507424,43.9484124 56.4827385,34.3682992 C55.9332701,30.1057819 55.7642029,25.5478427 56.3559381,21.2431222 C56.6095388,19.4283871 57.0322068,17.613652 57.4971416,15.8833232 C58.257944,13.2667285 59.6104815,10.9033525 59.6527483,8.16014832 C59.6950151,5.71236611 58.04661,3.39119333 55.8487365,2.50492735 C53.2704618,1.40764567 51.0725883,2.12509908 49.0015152,3.72881846 L49.0015152,3.72881846 Z"
                      fill="url(#linearGradient-39)"
                    />
                    <path
                      id="Path"
                      d="M97.9464673,14.2374007 C89.2395069,15.7145107 84.8860267,26.9827495 83.3221552,34.4949087 C81.4624161,43.4419747 81.3356157,52.768869 80.8284141,61.8847475 C80.2789457,71.5070638 80.1098785,81.2981927 78.6728074,90.8783058 C77.9542718,95.6050577 76.8976019,100.33181 75.2914636,104.805343 C74.572928,106.746687 73.727592,108.603625 72.7554557,110.41836 C71.5719853,112.655127 69.7967798,114.680878 68.8246435,116.959847 C67.5566395,119.95627 67.6834399,123.290319 70.5153154,125.442679 C73.2626573,127.510633 76.5594675,127.088601 79.1377422,124.936241 C82.5613528,122.066427 84.8860267,116.959847 86.6189654,112.950549 C88.6477717,108.308203 90.1271096,103.539248 91.099246,98.5592776 C93.0435187,88.6837424 93.4661867,78.5971916 94.0579219,68.595047 C94.5651234,59.6901842 94.6919238,49.6880396 95.7908606,41.3740207 C96.2557954,38.0399726 97.1433981,33.9462678 98.3691353,31.329673 C100.059807,27.7002029 102.469015,26.0542803 104.413287,22.678029 C107.118362,18.0356835 102.638082,13.435541 97.9464673,14.2374007 L97.9464673,14.2374007 Z"
                      fill="url(#linearGradient-40)"
                    />
                    <path
                      id="Path"
                      d="M119.418001,31.4984856 C105.216357,45.636538 90.5497776,60.3232313 79.9830781,77.4155036 C74.6997284,85.9827414 70.599849,95.3940419 68.0215743,105.100765 C66.6690368,110.165141 65.781434,115.271722 65.1896988,120.462708 C64.5556969,125.738101 63.7526277,131.815353 66.3731692,136.668714 C68.3597087,140.298185 74.4038608,140.551403 76.3481335,136.668714 C78.6728074,132.026369 78.123339,126.53996 78.6728074,121.475583 C79.1377422,117.00205 80.0676117,112.528517 81.2510821,108.181594 C83.6602896,99.3611373 87.3797678,91.0893215 92.2404495,83.3661466 C102.257681,67.4555622 116.205724,54.6258072 128.758963,40.7831768 C134.422714,34.5371118 125.462153,25.4634364 119.418001,31.4984856 L119.418001,31.4984856 Z"
                      fill="url(#linearGradient-41)"
                    />
                    <path
                      id="Path"
                      d="M122.757078,2.5471305 C117.135594,4.06644359 114.895453,11.1143682 113.669716,16.1365421 C112.401712,21.3275285 111.894511,26.7295306 111.894511,32.0471265 C111.852244,42.1758804 113.373849,52.2202281 113.75425,62.306779 C114.134651,72.6465486 113.331582,83.0285215 111.260509,93.1994786 C110.161572,98.5592776 108.766768,103.876873 107.033829,109.06786 C105.30089,114.385456 102.257681,119.618645 102.046347,125.231663 C101.835013,130.507056 108.555434,132.786025 112.148111,129.409774 C116.332524,125.442679 118.023196,119.027801 119.840669,113.668002 C121.489074,108.814641 122.883878,103.83467 123.982815,98.8124964 C126.349756,88.0506953 127.575493,76.9512691 127.490959,65.894046 C127.406425,55.6808857 125.927088,45.5943349 125.63122,35.4233778 C125.50442,30.8232353 125.50442,26.0964835 126.307489,21.5385442 C127.152825,16.8539955 130.576435,10.73454 128.970297,6.04999125 C127.998161,3.47559961 125.50442,1.82967709 122.757078,2.5471305 L122.757078,2.5471305 Z"
                      fill="url(#linearGradient-42)"
                    />
                    <path
                      id="Path"
                      d="M139.156595,13.8575724 C135.225783,15.2502761 132.09804,18.79534 129.012564,21.4963411 C125.842554,24.2817484 123.095212,27.6157966 120.432404,30.8654385 C115.022254,37.575738 110.246105,44.7080689 106.273026,52.3468375 C98.1155345,67.9619999 93.0435187,84.8854597 91.1415128,102.399763 C90.0848428,112.106486 90.0003093,122.150834 91.4796472,131.815353 C91.9868488,135.107198 95.917661,137.090746 98.9186036,136.668714 C102.046347,136.20448 105.005023,133.419072 104.793689,130.042821 C104.24422,121.855412 103.821552,113.794612 104.497821,105.607202 C105.131823,97.799621 106.653428,90.034243 108.809034,82.4376775 C113.162515,67.1179371 120.516937,52.7266658 130.238301,40.1079265 C132.858842,36.7316752 135.775251,33.6086427 138.522593,30.3590008 C141.565803,26.7295306 145.96155,21.8339662 144.101811,16.6429798 C143.425542,14.7438384 141.354469,13.0979159 139.156595,13.8575724 L139.156595,13.8575724 Z"
                      fill="url(#linearGradient-43)"
                    />
                    <path
                      id="Path"
                      d="M26.4733119,1.91408337 C24.0641044,6.97846036 22.3734325,11.6208059 21.6548969,17.1916206 C20.9786282,22.382607 21.1476953,27.5313903 21.8239641,32.7645799 C23.1342348,43.2731621 26.3465115,53.2753067 30.7845253,62.8554198 C34.7998711,71.5914701 39.9986872,79.7366764 45.8315054,87.3332419 C49.0015152,91.4691498 52.3405923,95.3940419 55.7219361,99.3611373 C58.9764795,103.15942 61.4279538,107.46414 64.5134301,111.304626 C66.2886356,113.49919 70.0926474,113.668002 72.3750545,112.317502 C74.8687956,110.882595 76.0945327,107.801766 75.3337304,105.016358 C74.0234596,100.120794 70.4307818,95.9004796 67.2607719,92.0177906 C64.3443629,88.4305236 61.2166198,85.0120691 58.3002108,81.3825989 C52.6787266,74.3346743 47.7757781,66.6537025 43.7604323,58.5929025 C39.7028197,50.3632899 36.8286774,41.5428333 35.3916063,32.4691579 C34.6730707,27.9112186 34.3772031,23.3110761 34.1658691,18.7109337 C33.9545351,13.8153693 33.6164007,8.70878916 33.7009343,3.81322474 C33.7854679,0.183754568 28.1639838,-1.63098052 26.4733119,1.91408337 L26.4733119,1.91408337 Z"
                      fill="url(#linearGradient-44)"
                    />
                    <path
                      id="Path"
                      d="M55.2992681,24.155139 C55.1724677,24.1973421 55.0456673,24.1973421 54.9611337,24.2395453 C51.9179243,24.9992018 50.3963195,27.742406 50.100452,30.6122196 C48.5365804,45.8053506 48.4520468,60.534247 54.6229993,74.7989089 C59.6104815,86.3203665 68.5287759,97.3353865 68.7823767,110.333954 C68.8246435,113.077158 68.4865091,115.313925 67.7679735,118.014926 C66.838104,121.475583 65.4010328,125.611491 68.9091771,128.270289 C72.3750545,130.844681 76.5594675,128.565711 78.6728074,125.400476 C80.7861473,122.23524 81.6737501,118.47916 82.096418,114.723081 C83.7025564,100.627231 76.5594675,88.0506953 70.2617146,76.0228 C66.8803708,69.5657193 64.0062285,62.9398261 63.0763589,55.6386826 C62.019689,47.3668668 62.7804914,38.8418322 63.3722265,30.5700165 C63.5412937,28.4598594 62.0619558,25.7588584 60.0754163,24.8725924 C58.469278,24.1973421 57.1167404,23.7331076 55.2992681,24.155139 L55.2992681,24.155139 Z"
                      fill="url(#linearGradient-45)"
                    />
                    <path
                      id="Path"
                      d="M78.5037402,25.9698741 C74.6151948,27.8268123 73.2203905,32.8489861 72.1214537,36.689472 C71.0647838,40.4455516 70.4307818,44.3704438 70.177181,48.295336 C69.6699794,55.8919014 70.6421158,63.4462638 71.6987857,70.958423 C73.5585248,84.0413969 76.7285347,98.2216524 71.4874517,110.924798 C72.0791869,109.911923 72.6286553,108.94125 73.2203905,107.928375 C73.1358569,108.054984 73.0090565,108.139391 72.9245229,108.266 C68.2329083,113.414783 72.9667897,120.378302 79.3490762,119.28102 C84.2097579,118.47916 85.5622955,112.655127 86.492165,108.603625 C87.337501,104.974155 87.760169,101.218075 87.9292362,97.504199 C88.2251037,89.6544147 87.0416334,81.8468335 85.8581631,74.1236586 C84.8014931,66.9913277 83.6602896,59.8589967 83.6602896,52.6422595 C83.6602896,49.1393988 83.8716235,45.6787412 84.5901591,42.2602867 C85.4354951,38.166582 88.0137697,33.5242364 86.703499,29.3039222 C85.6045623,25.6744521 81.8428172,24.4083578 78.5037402,25.9698741 L78.5037402,25.9698741 Z"
                      fill="url(#linearGradient-46)"
                    />
                    <path
                      id="Path"
                      d="M150.145963,52.178025 C145.96155,55.3010575 145.834749,60.3232313 145.158481,64.8389674 C144.524479,69.1014847 143.594609,73.3217989 142.411139,77.4999099 C140.128732,85.4763037 137.085522,92.9462597 132.985643,100.162997 C128.885763,107.337531 124.067348,113.963424 118.361331,119.914067 C115.360388,123.0371 112.190378,125.99132 108.851301,128.692321 C105.723558,131.224509 102.215414,133.25026 99.0031372,135.698042 C102.299947,137.048543 105.596758,138.35684 108.851301,139.707341 C107.879165,137.175152 106.737961,135.233808 103.990619,134.389745 C104.751422,134.853979 105.512224,135.276011 106.273026,135.740245 C106.103959,135.571433 105.934892,135.444823 105.808092,135.276011 C104.497821,133.967713 102.13088,133.545682 100.524742,134.60076 C101.665945,133.841104 99.0031372,135.360417 98.7495364,135.571433 C97.8619337,136.288886 97.2279317,137.175152 96.6361965,138.145824 C95.0300582,140.63581 95.6640602,144.223077 97.6928665,146.248828 C99.9330068,148.485594 103.103017,148.612203 105.808092,147.303906 C110.161572,145.235952 114.134651,141.901904 117.854129,138.905481 C121.446807,136.035667 124.870418,132.912635 128.040427,129.578587 C134.380447,122.91049 140.001931,115.440534 144.566745,107.46414 C149.13156,99.4877467 152.851038,90.8361027 155.302512,82.0156461 C156.528249,77.5843162 157.458119,73.0685801 158.092121,68.4684376 C158.76839,63.6150763 160.205461,56.6937611 155.936514,52.9798847 C154.457176,51.6293841 151.878901,50.8697276 150.145963,52.178025 L150.145963,52.178025 Z"
                      fill="url(#linearGradient-47)"
                    />
                    <path
                      id="Path"
                      d="M197.400243,33.5664395 C194.230233,37.1537066 191.440624,40.6565673 189.707686,45.1301003 C188.186081,49.0127894 187.594346,53.2753067 186.918077,57.3690114 C185.565539,65.6408271 184.847004,74.250268 181.000725,81.8468335 C176.943113,89.8654304 170.983494,96.617933 164.643474,102.906201 C158.303455,109.236672 151.2449,115.187315 142.91834,118.732379 C139.114329,120.378302 134.845382,121.517787 130.703236,121.771005 C125.884821,122.066427 116.92426,120.800333 116.92426,128.14368 C116.92426,140.044966 138.733927,134.72737 145.03168,132.406197 C154.414909,128.945539 162.572401,123.290319 169.926824,116.580019 C176.858579,110.291751 183.367666,103.286029 188.608749,95.5206514 C194.483834,86.9112105 197.44251,77.4155036 199.006381,67.2445465 C199.724917,62.4755915 200.232118,57.6222302 201.288788,52.8954784 C201.79599,50.5743056 202.429992,48.3375391 202.97946,46.0163663 C203.571195,43.6107872 203.740263,41.5428333 204.881466,39.3482699 C207.33294,34.7481275 201.161988,29.3039222 197.400243,33.5664395 L197.400243,33.5664395 Z"
                      fill="url(#linearGradient-48)"
                    />
                    <path
                      id="Path"
                      d="M161.45151,66.6135594 C158.366034,69.778795 156.97123,74.1679217 155.703226,78.3460327 C154.435222,82.4819406 153.547619,86.7444579 152.660016,90.9647721 C151.053878,98.392525 149.320939,105.651465 145.728261,112.150749 C139.641842,123.165769 129.497811,132.366054 117.874441,136.797384 C115.296167,137.768056 111.365355,139.118557 109.547882,139.118557 C107.519076,139.118557 105.61707,138.907541 103.799598,139.962619 C101.39039,141.355323 100.375987,144.14073 101.009989,146.799528 C103.334663,156.295235 116.18377,152.032718 122.312455,149.627139 C135.880097,144.26734 147.503467,134.856039 155.407358,122.574925 C160.141239,115.231578 163.015382,107.001966 164.959654,98.5191344 C166.016324,93.9611951 166.903927,89.4032558 168.002864,84.8453165 C169.144067,80.1607678 171.172874,75.6872348 171.764609,70.8760767 C172.314077,65.5162777 164.790587,63.1951049 161.45151,66.6135594 L161.45151,66.6135594 Z"
                      fill="url(#linearGradient-49)"
                    />
                    <path
                      id="Path"
                      d="M0.606031527,10.6923368 C-0.831039605,21.1165128 0.267897143,31.6672982 4.11417576,41.5006302 C7.91818758,51.1651496 13.9623397,59.2681528 20.8518278,66.9491245 C27.1495807,73.9970492 34.0390687,80.5807393 38.9842841,88.6837424 C41.3934916,92.6086346 43.3377643,96.7023393 44.3944342,101.218075 C45.493371,105.902624 44.7748354,111.135814 48.2829796,114.891893 C49.677784,116.369003 52.1292583,116.622222 53.8199302,115.609347 C63.3722265,109.954126 56.8631396,93.5371037 53.1013946,86.1515539 C48.5788472,77.2044879 41.7738928,69.7345319 35.0112051,62.3911852 C28.6289186,55.46987 22.2043653,48.5063517 18.1044859,39.9391139 C14.0046065,31.329673 12.9902033,21.8761693 13.6242053,12.4648688 C13.8355393,9.21522686 10.961397,6.34541324 7.91818758,6.0077881 C4.91724492,5.62795983 1.0709663,7.40049178 0.606031527,10.6923368 L0.606031527,10.6923368 Z"
                      fill="url(#linearGradient-50)"
                    />
                    <path
                      id="Path"
                      d="M34.4194699,11.4941965 C31.9257288,15.0814635 29.6010549,18.3311054 28.2485174,22.5514196 C27.0227803,26.4763118 26.6001123,30.8232353 26.2619779,34.8747369 C25.6279759,43.1887558 26.5155787,51.587181 27.9526498,59.7745905 C29.4319877,68.1308125 31.6298612,76.3604251 33.6164007,84.6322408 C34.6308039,88.7681487 35.5606735,92.9462597 36.4060094,97.1243707 C36.8709442,99.4033404 37.5049462,101.555701 38.2657485,103.750264 C39.1533513,106.324656 40.5058888,107.632953 42.7037623,109.110063 C44.0140331,109.996329 46.2119065,109.700907 47.2685765,108.519219 C48.832448,106.831093 50.0581852,105.058561 50.2272524,102.695185 C50.3963195,100.33181 50.2272524,97.9684336 49.889118,95.6472608 C49.2973828,91.5957592 48.3252464,87.5864608 47.3953769,83.6193654 C45.4511042,75.4741591 43.2532307,67.3711559 41.6470924,59.1415433 C40.252288,51.9670093 39.4914857,44.6658658 39.7028197,37.3225191 C39.7873533,33.6508458 40.2945548,30.1479851 40.9708236,26.560718 C41.6893592,22.7624353 41.8161596,18.79534 42.9573631,15.0814635 C44.5635014,9.80607085 37.2936122,7.35828863 34.4194699,11.4941965 L34.4194699,11.4941965 Z"
                      fill="url(#linearGradient-51)"
                    />
                    <path
                      id="Path"
                      d="M44.3944342,41.5850364 C44.3944342,41.5850364 44.3521674,41.5850364 44.3521674,41.5850364 C41.5625588,40.6987705 39.0265509,42.2602867 37.4204126,44.4126469 C34.0813355,48.8861799 34.4194699,56.2295266 34.9266715,61.5471224 C35.4761399,67.2445465 36.5328098,72.8997675 37.8430805,78.5127853 C40.463622,89.8654304 43.8872327,101.00706 47.0149757,112.233095 C47.8180449,115.145112 48.5788472,118.099332 49.5509836,120.969146 C50.5653867,123.965569 51.7488571,127.932664 54.6652661,129.62079 C57.201274,131.0979 60.3712839,130.380446 62.1042226,128.14368 C64.3020961,125.316069 63.3299597,121.137958 62.653691,117.93052 C60.1176831,106.451265 56.1868709,95.1830262 53.1436614,83.8303812 C51.4529895,77.5421131 49.9313848,71.2116418 48.8747148,64.7967643 C48.4520468,62.2223727 48.1984461,59.6057779 48.1984461,56.9891831 C48.1561793,53.8661506 49.043782,50.6165087 48.7901812,47.5356794 C48.621114,45.5521318 47.7757781,43.1465527 45.7469718,42.2602867 C45.3665706,41.9648647 44.859369,41.7960522 44.3944342,41.5850364 L44.3944342,41.5850364 Z"
                      fill="url(#linearGradient-52)"
                    />
                    <path
                      id="Path"
                      d="M95.0300582,49.8990553 C93.1703191,52.6422595 92.7053843,56.356136 92.1981827,59.5635748 C91.6487144,62.8554198 91.31058,66.1472648 90.7188448,69.4391099 C89.5353745,76.1916125 87.9715029,82.8597089 86.0272302,89.443399 C82.1809516,102.230951 76.7285347,114.343253 69.754513,125.695898 C68.5287759,127.679445 68.4865091,130.549259 69.754513,132.532807 C71.233851,134.811776 72.9245229,135.613636 75.5873311,135.866855 C77.912005,136.120074 80.2789457,134.389745 81.4201493,132.532807 C88.9859061,120.209489 94.9455246,106.873296 99.1299376,93.0728692 C101.158744,86.3625696 102.764882,79.4834576 103.821552,72.5621424 C104.878222,65.6408271 106.907028,56.3983391 103.356617,49.8990553 C101.539145,46.5650072 96.9743309,47.0292417 95.0300582,49.8990553 L95.0300582,49.8990553 Z"
                      fill="url(#linearGradient-53)"
                    />
                    <path
                      id="Path"
                      d="M105.934892,34.1572835 C112.82438,50.4898993 111.76771,69.3969067 107.371963,86.1937571 C105.005023,95.2674325 101.708212,104.130092 98.0310009,112.781736 C96.0867282,117.297472 94.0579219,121.771005 91.9868488,126.244538 C91.0569792,128.228086 90.1693764,130.169431 89.1127065,132.110775 C89.4508409,131.477728 88.2673705,133.039244 89.0281729,132.363994 C87.8447026,133.419072 86.703499,133.883307 85.9426966,135.40262 C84.6746927,137.850402 84.9705603,140.593607 86.8725662,142.619357 C91.9868488,148.063563 99.0031372,142.577154 101.623679,137.597184 C104.159687,132.743822 106.273026,127.552836 108.513167,122.530662 C112.993447,112.401908 117.17786,102.062138 120.094269,91.3425404 C125.884821,70.2409696 126.56109,47.7466951 117.473728,27.446984 C115.99439,24.155139 111.218242,23.3954824 108.3441,25.041405 C104.920489,27.0671557 104.540088,30.8232353 105.934892,34.1572835 L105.934892,34.1572835 Z"
                      fill="url(#linearGradient-54)"
                    />
                    <path
                      id="Path"
                      d="M174.407105,31.625095 C165.023876,33.5242364 158.007587,43.5685841 152.851038,50.9119307 C147.483155,58.5084962 143.129674,66.8225151 139.452463,75.3475497 C135.183516,85.1808817 131.675372,95.3096357 128.167228,105.43839 C126.434289,110.460563 124.659084,115.52494 122.799344,120.504911 C121.911742,122.826084 121.024139,125.147257 120.094269,127.46843 C119.375734,129.240961 118.530398,131.941963 117.558262,132.743822 C118.530398,132.152978 119.544801,131.604337 120.516937,131.013493 C119.756135,131.266712 119.756135,131.308915 120.559204,131.055697 C114.684119,130.760275 112.908914,137.892606 116.12119,141.733091 C118.445864,144.476296 122.58801,144.982733 125.673487,143.336811 C128.420829,141.901904 129.646566,139.369715 130.830036,136.668714 C133.196977,131.224509 135.352583,125.738101 137.38139,120.167286 C141.269935,109.489891 144.735813,98.6014807 148.835692,88.0084922 C152.386103,78.8504104 156.570516,69.9033444 161.853866,61.5893255 C164.347607,57.6644334 167.094949,53.9083538 170.222692,50.405493 C173.604036,46.6494134 177.534848,43.2731621 179.732721,38.6730197 C181.634727,34.7903307 178.633785,30.7810322 174.407105,31.625095 L174.407105,31.625095 Z"
                      fill="url(#linearGradient-55)"
                    />
                    <path
                      id="Path"
                      d="M153.231439,32.3425484 C153.189172,32.3003453 153.146905,32.2581422 153.146905,32.215939 C151.540767,29.8525631 148.666625,28.3754531 145.792483,29.219516 C129.308431,34.1572835 119.840669,52.9798847 116.332524,68.5106408 C114.345985,77.3733005 113.711983,86.5313822 114.176918,95.5628545 C114.430518,100.542825 114.93772,105.522796 115.656256,110.460563 C116.374791,115.398331 117.346928,120.884739 122.46121,122.91049 C124.025082,123.543537 125.800287,122.741678 126.983757,121.728802 C130.491902,118.647973 129.477499,112.950549 128.970297,108.856844 C128.463095,104.805343 127.998161,100.753841 127.786827,96.6601362 C127.364159,88.9369613 127.575493,81.1293801 129.139364,73.5750178 C130.618702,66.4426868 133.112443,59.6901842 137.000989,53.4863224 C140.509133,47.9155077 144.90488,43.9906155 150.779965,41.163005 C152.681971,40.2345359 154.161309,37.6601443 153.992241,35.5499872 C153.949975,34.4105024 153.865441,33.2288144 153.231439,32.3425484 L153.231439,32.3425484 Z"
                      fill="url(#linearGradient-56)"
                    />
                    <path
                      id="Path"
                      d="M136.705121,53.5285255 C132.09804,52.9798847 129.350698,57.8332459 129.308431,61.8003413 C129.266165,65.3454051 130.153767,68.8060628 129.942433,72.3933298 C129.519765,79.5678639 127.321892,86.7001948 125.208552,93.5371037 C123.179746,100.120794 120.812805,106.662281 118.023196,112.992752 C116.543858,116.369003 114.979987,119.660848 113.331582,122.952693 C111.556376,126.455554 108.175032,130.675868 108.555434,134.685167 C109.020368,139.538528 113.416115,142.155123 117.854129,140.002763 C121.362273,138.314637 122.926145,134.009916 124.616817,130.718071 C126.307489,127.46843 127.87136,124.134381 129.350698,120.800333 C132.351641,114.047831 135.056716,107.168718 137.38139,100.120794 C139.579263,93.4104943 141.60807,86.5313822 142.66474,79.4834576 C143.256475,75.5163623 143.636876,71.5070638 143.341008,67.4977654 C143.171941,65.4720146 142.91834,63.4462638 142.537939,61.4627161 C142.495672,61.2094973 142.368872,59.6901842 142.368872,60.6608564 C142.368872,60.1544187 142.453406,59.647981 142.411139,59.1415433 C142.284338,55.8496983 139.875131,53.9083538 136.705121,53.5285255 L136.705121,53.5285255 Z"
                      fill="url(#linearGradient-57)"
                    />
                    <path
                      id="Path"
                      d="M176.604978,28.1644374 C175.548308,33.4398301 175.886443,38.7996291 175.759642,44.1594281 C175.632842,49.1393988 175.336974,54.0771663 174.449372,58.9727308 C172.631899,68.9748753 169.166022,78.5549885 164.009473,87.2910388 C159.275591,95.3096357 153.231439,102.399763 146.215151,108.519219 C142.833807,111.473439 139.156595,114.090034 135.352583,116.45341 C133.323777,117.719504 131.252704,118.858989 129.097097,119.95627 C126.011621,121.517787 124.067348,122.868287 122.714811,126.202335 C121.446807,129.325368 124.151882,132.617213 126.899224,133.545682 C131.421771,135.107198 136.493787,131.562134 140.297799,129.367571 C143.636876,127.426226 146.891419,125.231663 149.976896,122.868287 C156.65505,117.80391 162.699202,112.064283 167.898018,105.480593 C178.802852,91.5957592 185.903674,75.3053466 188.312881,57.7910428 C189.665419,47.8733045 190.637555,36.0564249 185.565539,27.0249526 C183.579,23.5220919 177.408047,23.9863264 176.604978,28.1644374 L176.604978,28.1644374 Z"
                      fill="url(#linearGradient-58)"
                    />
                    <path
                      id="Path"
                      d="M219.252177,58.5084962 C213.926561,57.0313863 210.207083,61.3361067 208.939079,66.0206554 C208.093743,69.2280942 207.755608,72.4777361 206.318537,75.5163623 C203.106261,82.2688649 197.865178,87.670867 192.835429,93.030666 C182.268729,104.214499 171.321629,115.356128 158.049854,123.374725 C154.66851,125.442679 151.118099,127.34182 147.440888,128.81893 C142.749273,130.718071 136.197919,131.182306 134.507248,136.795324 C133.915512,138.736668 134.549514,140.931232 135.986585,142.366139 C139.875131,146.291031 145.327548,144.096467 149.765562,142.450545 C153.61184,141.015638 157.331318,139.369715 160.966263,137.428371 C168.278419,133.503479 174.956573,128.565711 181.296593,123.248115 C187.383012,118.099332 193.08903,112.486314 198.62598,106.746687 C204.289731,100.88045 210.038016,95.0142137 214.687363,88.3039142 C217.307905,84.5056314 219.505778,80.2431141 220.689249,75.727378 C221.238717,73.7016272 221.407784,71.6336732 221.872719,69.6079224 C222.168587,68.3840313 222.337654,68.595047 222.802589,67.1601402 C223.140723,66.1050617 223.352057,64.8811706 223.30979,63.7838889 C223.098456,61.3361067 221.619118,59.1837465 219.252177,58.5084962 L219.252177,58.5084962 Z"
                      fill="url(#linearGradient-59)"
                    />
                    <path
                      id="Path"
                      d="M230.410612,71.7602827 C226.775668,74.7989089 226.564334,80.9605675 224.746861,85.1386785 C222.887122,89.443399 220.182047,93.4526974 217.307905,97.1243707 C211.644154,104.425514 205.008267,111.051407 197.907444,116.959847 C190.848889,122.868287 183.029532,127.890461 174.787506,132.026369 C170.941227,133.967713 167.010415,135.698042 162.952803,137.175152 C160.670395,138.019215 158.303455,138.778871 155.978781,139.454122 C155.429313,139.622934 151.921168,140.171575 154.245842,140.171575 C152.42837,140.129372 151.540767,139.791747 149.681028,140.171575 C147.821289,140.5092 145.834749,142.450545 145.538882,144.307483 C144.186344,152.115064 151.456234,154.689456 157.83852,153.085736 C161.811599,152.072861 165.742411,150.680157 169.58869,149.160844 C177.830715,145.911202 185.776873,141.98631 193.21583,137.175152 C207.755608,127.806055 221.238717,115.609347 231.002347,101.302482 C233.87649,97.0821676 236.285697,92.5242283 238.018636,87.7130702 C239.751574,82.901912 241.230912,75.7695811 237.088766,71.7602827 C235.144494,69.8611413 232.397152,70.1143601 230.410612,71.7602827 L230.410612,71.7602827 Z"
                      fill="url(#linearGradient-60)"
                    />
                    <path
                      id="Path"
                      d="M203.317595,49.5614302 C200.358919,51.7137904 199.640383,53.8661506 198.541446,57.2001988 C197.865178,59.3103559 197.146642,61.420513 196.470373,63.5306701 C195.033302,68.0886093 193.638498,72.6465486 192.201427,77.1622848 C189.538618,85.4341005 186.241808,93.2416817 181.676994,100.627231 C177.365781,107.59075 172.336032,114.047831 166.925882,120.209489 C164.136273,123.416928 161.219864,126.53996 158.303455,129.62079 C155.175712,132.912635 151.456234,136.20448 150.31503,140.720216 C149.300627,144.729514 153.020105,148.781016 157.162251,147.557125 C161.980666,146.122218 165.319743,142.070717 168.616553,138.525653 C171.532963,135.444823 174.407105,132.279588 177.196713,129.072149 C182.987265,122.404053 188.524215,115.398331 193.173563,107.886172 C198.076512,100.036388 201.711456,91.5957592 204.627865,82.8175058 C206.107203,78.3017696 207.502008,73.7438303 208.896812,69.2280942 C209.657614,66.7381088 210.37615,64.2903266 211.136952,61.8003413 C211.982288,58.8883245 213.165759,56.1451203 212.066822,53.1486972 C210.925618,49.8568522 206.698938,47.1558511 203.317595,49.5614302 L203.317595,49.5614302 Z"
                      fill="url(#linearGradient-61)"
                    />
                    <path
                      id="Path"
                      d="M218.02644,72.1401109 C217.89964,72.1401109 217.77284,72.1401109 217.646039,72.1401109 C215.490432,72.0979078 213.250292,73.364002 212.193622,75.2631434 C208.431877,82.1422555 205.346401,89.3589927 201.457856,96.1959016 C197.653844,102.863998 193.384897,109.321079 188.777816,115.482737 C184.382069,121.348974 179.310053,126.582164 174.491638,132.068572 C171.955631,134.938386 169.419623,138.019215 167.644417,141.437669 C165.784678,144.982733 163.755872,149.962704 165.192943,153.972002 C166.968148,158.867567 174.026704,160.597896 176.858579,155.491316 C177.915249,153.634377 177.999783,151.819642 178.676051,149.836095 C179.140986,148.485594 179.901789,147.2195 180.704858,145.995609 C182.353263,143.421217 184.466603,141.184451 186.579943,138.947684 C191.947826,133.165854 197.019842,127.130804 201.711456,120.75813 C206.191737,114.680878 210.291616,108.350406 213.968828,101.766716 C217.815106,94.9298074 221.576851,87.6286639 223.774725,80.1165047 C224.36646,78.0063476 223.774725,75.5163623 222.168587,73.9970492 C220.942849,72.8575643 219.674845,72.1823141 218.02644,72.1401109 L218.02644,72.1401109 Z"
                      fill="url(#linearGradient-98)"
                    />
                    <path
                      id="Path"
                      d="M248.796669,76.7402534 C246.387462,80.0743016 243.724654,83.1551309 241.357713,86.5313822 C239.328907,89.4011958 237.257833,92.1866032 234.975426,94.8454011 C229.861144,100.88045 224.197393,106.366859 218.237774,111.557845 C212.278156,116.791035 206.02267,121.686599 199.767184,126.582164 C196.723974,128.945539 193.680765,131.351119 190.891156,134.009916 C187.467545,137.343965 182.818198,141.775295 184.424336,147.008484 C185.142872,149.329657 187.552079,151.608627 190.17262,151.397611 C193.723031,151.102189 195.117836,149.751688 197.273443,147.177297 C198.49918,145.700187 199.80945,144.307483 201.204255,142.999186 C204.120664,140.255981 207.33294,137.765996 210.50295,135.318214 C216.885237,130.338243 223.225256,125.273866 229.227142,119.871864 C235.102227,114.596471 240.681444,109.025657 245.711193,102.948404 C248.458535,99.6143561 251.03681,96.1536985 253.319217,92.4820252 C255.559357,88.8103519 256.869628,84.8010534 258.053098,80.6651455 C259.74377,74.7989089 252.008946,72.3089235 248.796669,76.7402534 L248.796669,76.7402534 Z"
                      fill="url(#linearGradient-99)"
                    />
                    <path
                      id="Path"
                      d="M176.097777,77.4155036 C174.195771,79.8632858 172.209231,82.3954743 170.814427,85.2230848 C169.377356,88.1773047 168.53202,91.3847435 167.644417,94.507776 C165.784678,101.091466 164.009473,107.801766 164.728008,114.723081 C165.446544,121.517787 167.517617,127.890461 169.546423,134.389745 C170.560826,137.597184 171.575229,140.846825 172.547366,144.054264 C173.054567,145.657984 173.519502,147.303906 174.06897,148.865422 C174.914306,151.397611 176.05551,152.874721 178.211117,154.520643 C181.550194,157.095035 186.157275,154.183018 187.256211,150.84897 C188.397415,147.430515 186.87581,144.223077 185.861407,140.973435 C184.931538,137.934809 183.959401,134.896182 183.029532,131.857556 C181.254326,126.202335 179.014186,120.420505 178.29565,114.512065 C177.661648,109.194469 179.014186,104.172295 180.324457,99.0657153 C181.719261,93.62151 182.860464,87.7974765 184.931538,82.5642869 C186.918077,77.7531288 179.310053,73.2795958 176.097777,77.4155036 L176.097777,77.4155036 Z"
                      fill="url(#linearGradient-100)"
                    />
                    <path
                      id="Path"
                      d="M116.701269,54.516006 C112.180315,57.9756464 110.53385,63.5887879 108.675955,68.821992 C106.986938,73.5065457 105.509257,78.2755812 104.369698,83.129138 C102.048292,92.7518226 100.61448,102.67024 100.110419,112.546739 C99.6063706,122.465446 100.116611,132.384469 101.472064,142.21934 C102.149798,147.15788 103.038828,152.054277 104.181417,156.908546 C105.366321,161.931659 106.298193,168.685219 111.201428,171.388056 C113.610784,172.739462 117.498703,172.149763 118.765707,169.406643 C121.130785,164.300221 118.762572,159.361154 117.535379,154.253611 C116.435158,149.737019 115.503971,145.178272 114.868592,140.535201 C113.597938,131.586723 113.256997,122.469703 113.67681,113.479545 C114.096611,104.447178 115.361678,95.4994908 117.514286,86.6787043 C118.611689,82.1627978 119.878152,77.689152 121.355939,73.25778 C122.791516,68.9952265 125.790564,64.0156259 125.408769,59.4148422 C125.069514,55.7004383 120.50394,51.6048447 116.701269,54.516006 L116.701269,54.516006 Z"
                      fill="url(#linearGradient-101)"
                      transform="translate(112.680967, 112.806747) rotate(-20.000000) translate(-112.680967, -112.806747) "
                    />
                    <path
                      id="Path"
                      d="M122.481522,96.9576182 C118.297109,102.021995 118.297109,109.576357 118.719777,115.864626 C119.184712,122.321706 120.66405,128.694381 122.988724,134.687227 C125.186598,140.342448 127.933939,145.786653 131.146216,150.977639 C134.358493,156.126423 137.993437,162.710113 142.938653,166.29738 C147.418933,169.547022 154.477489,164.102816 152.533216,158.954033 C150.63121,153.889656 146.362263,149.542733 143.445854,144.984793 C140.740779,140.722276 138.204771,136.290946 136.302765,131.606397 C134.316226,126.795239 132.836888,121.604253 132.329686,116.413266 C132.076086,113.670062 131.991552,110.926858 132.160619,108.225857 C132.371953,105.229434 132.921422,102.570636 132.202886,99.5742129 C131.315283,95.5227114 125.313398,93.5813668 122.481522,96.9576182 L122.481522,96.9576182 Z"
                      fill="url(#linearGradient-102)"
                    />
                    <path
                      id="Path"
                      d="M220.878053,106.272683 C217.87711,104.75337 214.411232,104.87998 211.832958,107.243356 C209.888685,109.015888 208.874282,111.632482 207.817612,113.995858 C205.746539,118.469391 204.0136,123.069534 201.435325,127.289848 C198.814784,131.636771 195.179839,134.928616 191.418094,138.262665 C189.262488,140.161806 187.064614,142.060947 184.909007,144.002292 C182.795668,145.85923 180.301926,147.631762 178.526721,149.868529 C176.455648,152.44292 175.821646,155.776968 178.019519,158.520173 C180.006059,161.010158 183.68327,161.938627 186.515146,160.208298 C191.20676,157.380688 195.30664,152.907155 199.406519,149.319888 C203.295065,145.901433 207.099076,142.567385 210.226819,138.431477 C215.806037,131.088131 217.87711,122.309877 221.934723,114.249077 C221.216187,114.966531 220.497651,115.683984 219.779116,116.401437 C219.948183,116.274828 220.11725,116.148218 220.286317,116.063812 C219.314181,116.317031 218.342045,116.612453 217.369908,116.865672 C217.581242,116.865672 217.792576,116.865672 218.00391,116.865672 C223.456327,116.865672 226.034602,108.889278 220.878053,106.272683 L220.878053,106.272683 Z"
                      fill="url(#linearGradient-103)"
                    />
                    <path
                      id="Path"
                      d="M248.211571,59.8716086 C246.689967,68.9030809 245.59103,77.9767563 242.42102,86.5861972 C239.208743,95.3222475 234.348062,103.467454 229.149245,111.148426 C224.246297,118.365163 218.878414,125.413087 212.622927,131.574746 C209.664252,134.44456 206.536509,137.103358 203.028364,139.255718 C198.674884,141.956719 193.222467,143.054001 191.193661,148.202784 C190.263791,150.56616 191.827663,153.435973 193.814202,154.659865 C198.970752,157.782897 205.395305,153.773599 209.875586,150.988191 C214.186799,148.28719 218.244412,145.037548 221.879356,141.492484 C228.980178,134.613372 235.02433,126.552572 240.603548,118.407366 C246.436366,109.840128 251.508382,100.766453 255.143326,91.0597302 C258.862804,81.0997888 261.229745,70.2113782 258.102002,59.8294054 C256.749465,55.3980756 249.099174,54.5962159 248.211571,59.8716086 L248.211571,59.8716086 Z"
                      fill="url(#linearGradient-104)"
                    />
                    <path
                      id="Path"
                      d="M87.8227481,89.1136796 C81.7363292,93.5872126 81.144594,102.576482 81.1868608,109.624406 C81.2291276,116.967753 82.7929992,124.142287 85.6671414,130.89479 C88.1608825,136.718823 91.5844931,141.994216 95.2617046,147.142999 C97.2059773,149.844 99.2347836,152.502798 101.179056,155.203799 C103.334663,158.200222 105.278936,161.66088 108.702546,163.391209 C112.422025,165.248147 117.409507,163.01138 117.282706,158.495644 C117.113639,152.249579 111.914823,147.01639 108.406679,142.205232 C104.856268,137.35187 101.39039,132.456306 98.7698488,127.054304 C96.3606413,122.116536 94.965837,116.587925 94.7122362,111.101516 C94.5854358,108.400515 94.6699694,105.699514 94.965837,102.998513 C95.388505,99.4112461 96.4874417,95.7395728 95.3462382,92.1945089 C94.4163686,89.3668984 90.6123568,87.0457256 87.8227481,89.1136796 L87.8227481,89.1136796 Z"
                      fill="url(#linearGradient-105)"
                    />
                    <path
                      id="Path"
                      d="M57.758752,99.9301481 C54.8423429,105.121134 56.702082,112.7177 57.9278192,118.204108 C59.1958231,123.817126 61.1400958,129.387941 63.8451709,134.494521 C66.127578,138.841445 69.1285206,142.892946 72.5521313,146.395807 C76.0602755,149.940871 81.6394928,155.216264 87.049643,154.709826 C91.4876568,154.287794 94.5308662,149.983074 92.2061923,145.76276 C90.0505856,141.964477 85.2321707,139.896523 82.1889612,136.815694 C79.3993525,133.988083 77.2437458,130.780645 75.4262735,127.277784 C73.2706668,123.141876 71.8335957,118.710546 70.7769258,114.19481 C69.5934554,109.046027 69.5934554,103.221993 66.2543784,98.9172727 C64.0987717,96.047459 59.3226235,97.1869439 57.758752,99.9301481 L57.758752,99.9301481 Z"
                      fill="url(#linearGradient-106)"
                    />
                    <path
                      id="Path"
                      d="M265.320852,94.840363 C260.967371,92.1393619 255.05002,94.6715504 251.034674,96.9927232 C247.230662,99.1872866 243.849318,102.310319 240.721575,105.391148 C237.678366,108.429775 234.761957,111.59501 231.465146,114.380418 C227.830202,117.50345 223.688056,120.035639 219.545909,122.483421 C210.204947,128.012032 200.737184,133.329628 191.227155,138.562818 C186.366473,141.221616 181.463524,143.83821 176.518309,146.412602 C174.235902,147.636493 171.911228,148.818181 169.628821,149.999869 C166.839212,151.434776 163.83827,152.616464 161.555862,154.85323 C159.527056,156.836778 159.104388,160.213029 160.541459,162.660811 C162.105331,165.319609 164.979473,166.079266 167.811349,165.615031 C170.854558,165.108594 173.770967,163.125046 176.476042,161.732342 C178.800716,160.550654 181.083123,159.368966 183.36553,158.145075 C187.972611,155.739496 192.537425,153.291714 197.10224,150.801729 C206.485469,145.695149 215.826431,140.461959 225.040593,134.975551 C233.451686,129.953377 240.932909,124.298156 247.78013,117.292434 C250.273871,114.760246 253.06348,111.848229 255.684022,109.822478 C257.16336,108.682993 258.769498,107.670118 260.417903,106.826055 C262.362176,105.81318 264.81365,105.348945 266.335255,103.449804 C268.659929,100.7066 268.575395,96.8661138 265.320852,94.840363 L265.320852,94.840363 Z"
                      fill="url(#linearGradient-107)"
                    />
                    <path
                      id="Path"
                      d="M189.982697,87.2095715 C183.684944,99.7861077 177.260391,112.362644 170.328636,124.601555 C166.862759,130.636604 163.143281,136.545044 159.085668,142.200265 C157.352729,144.648047 155.535257,147.053626 153.548717,149.290393 C151.308577,151.864784 148.518968,153.890535 146.321095,156.50713 C144.503623,158.65949 143.869621,161.529304 145.348959,164.061492 C146.701496,166.382665 149.786972,167.775369 152.407514,166.931306 C159.71967,164.652336 164.664885,157.393396 168.976099,151.484956 C173.414112,145.449907 177.429458,139.161639 181.148936,132.662355 C188.714693,119.410569 194.336177,105.441329 199.154592,91.0500574 C200.972065,85.7324616 192.560972,82.1029914 189.982697,87.2095715 L189.982697,87.2095715 Z"
                      fill="url(#linearGradient-108)"
                    />
                    <g
                      id="Clownfish"
                      transform="translate(94.567026, 85.199538) rotate(10.000000) translate(-94.567026, -85.199538) translate(26.764253, 44.607088)"
                    >
                      <path
                        id="Path"
                        d="M40.3550066,69.5027988 C39.1637921,68.3036885 39.0937207,65.6585922 40.179828,63.6483191 C41.9666496,60.897419 42.9126141,58.2170548 44.3140428,55.3956188 C46.8015789,54.3023123 49.6394721,53.9143649 52.3372225,54.3375803 L69.4346534,62.308137 C66.6317958,65.9407358 63.1982954,69.1148513 59.4144377,71.6894117 C52.897794,74.0523644 45.5753287,73.9818285 40.3550066,69.5027988 Z"
                        fill="url(#linearGradient-62)"
                      />
                      <path
                        id="Path"
                        d="M38.931802,60.7481046 C39.2827879,59.718168 40.0549568,58.7592614 40.6516327,57.6938097 C41.7747875,56.663873 43.1085338,55.8115116 44.4773786,55.2077557 C43.0734352,58.0844753 42.0906748,60.7481046 40.3357455,63.5182791 C39.2476893,65.5426374 39.3178865,68.2062667 40.5112384,69.4137787 C45.7760263,73.924191 53.1116308,73.9952211 59.6048692,71.6157122 C57.7095455,72.9297693 55.6738276,74.0662512 53.603011,75.0606728 C50.4792368,75.4513384 47.3203641,75.3092782 44.3369843,74.598977 C41.8800832,74.1017662 39.3529851,72.7877091 38.2649289,70.5147454 C36.8258869,67.4604505 37.9841402,63.8379146 38.931802,60.7481046 Z"
                        fill="url(#linearGradient-63)"
                      />
                      <path
                        id="Path"
                        d="M40.3277447,58.2430531 C40.432381,58.1368087 40.5370173,58.0305642 40.6765324,57.9243197 C40.0835932,59.0221793 39.351139,59.9783795 38.9674724,60.9699946 C38.0257455,64.0156695 36.8747459,67.6633963 38.2698969,70.6736564 C39.3162602,72.9402051 41.8624107,74.2505536 44.303925,74.7463611 C47.2686208,75.4546576 50.4077106,75.5963169 53.5119215,75.2067539 C52.1516493,75.8442207 50.7913771,76.4108579 49.3962261,76.9066654 C46.0827425,78.0753546 42.1065622,78.7128214 39.2813814,76.6233468 C37.3630488,75.2067539 36.3864431,72.7985458 36.1074129,70.4257526 C35.5493525,65.9634848 37.1537761,61.3241428 40.3277447,58.2430531 Z"
                        fill="url(#linearGradient-64)"
                      />
                      <path
                        id="Path"
                        d="M74.9684806,5.3781161 C84.1211148,0.518059522 95.7379198,1.72420495 104.784947,7.3292337 C106.897093,9.63509996 108.481203,12.4730892 109.290859,15.6303522 L81.6217416,17.3331458 C80.6360733,18.2554923 79.2631782,18.5392912 77.9606879,18.326442 C73.6307879,14.5306314 70.4273659,7.68398235 74.9684806,5.3781161 Z"
                        fill="url(#linearGradient-65)"
                      />
                      <path
                        id="Path"
                        d="M72.7562676,3.81851581 C73.9885378,2.18496444 76.0305856,1.65228464 77.9318025,1.26165279 C84.1635691,-0.0167787143 90.7122051,-0.371898578 96.8031408,1.86535656 C100.077459,3.0727641 102.431488,4.6647472 104.860821,7.39917014 C95.8124365,1.7882763 84.9733467,1.01306889 75.7841316,5.87821102 C71.2423356,8.18649013 74.4814459,15.0403035 78.7415801,18.804574 C78.002218,18.6980381 77.2980635,18.4139422 76.6291169,17.9877984 C74.8335231,16.8514148 73.5660451,14.8627436 72.6858521,12.8030484 C71.4887896,9.89106547 70.9254661,6.19781889 72.7562676,3.81851581 Z"
                        fill="url(#linearGradient-66)"
                      />
                      <path
                        id="Path"
                        d="M26.209857,18.703292 C28.7108862,15.9705778 33.078881,15.6202298 36.9184892,15.8654734 C44.3511254,16.3909954 51.572407,18.5981876 57.8425929,22.2067718 C49.8111188,18.878466 40.9694521,17.6872829 32.4448172,19.228814 C30.084691,19.5090924 27.0200496,20.6652407 26.808695,23.0826417 C26.6325662,31.0705756 33.7129447,35.6250993 40.7580975,37.8322915 C37.693456,38.0425003 34.558363,37.4469088 31.9164308,36.0455169 C27.7950164,33.8733594 24.9065038,29.8093229 24.4133431,25.4299732 C24.0963112,23.1176765 24.5190204,20.5251015 26.209857,18.703292 Z"
                        fill="url(#linearGradient-67)"
                      />
                      <path
                        id="Path"
                        d="M32.6624304,32.2481572 C31.7049298,31.000585 31.0665961,30.0381721 30.1445585,29.0401143 C28.5841871,27.0796437 28.1586313,23.6220864 29.1515949,22.9804778 C38.0882671,18.417928 48.5143847,19.0238916 58.1957795,22.445804 C59.0114282,22.9804778 59.8270769,23.5151516 60.6427255,24.0854704 L44.3652154,36.2047434 C43.7978077,36.4186129 43.2303999,36.6324825 42.6629921,36.7750621 C39.0812307,35.9908739 35.6058581,34.8502364 32.6624304,32.2481572 Z"
                        fill="url(#linearGradient-68)"
                      />
                      <path
                        id="Path"
                        d="M26.6022095,23.1154196 C26.8477947,20.6674493 29.8649838,19.4966809 32.2155846,19.2128583 C40.7058143,17.6163559 49.5117965,18.85808 57.5108559,22.2284739 C58.0371098,22.5477743 58.5984473,22.8670748 59.1247012,23.2218531 C49.5468801,19.8159814 39.2323034,19.2128583 30.3912377,23.7540206 C29.4088971,24.4280993 29.8299002,27.8339711 31.3735783,29.7852517 C32.2857518,30.7431532 32.9172565,31.7365324 33.8645135,32.9782565 C36.7764518,35.5681381 40.214644,36.7034287 43.758087,37.5194188 C42.6704956,37.8032414 41.5829042,38.0161084 40.4602292,38.087064 C33.5136776,35.8164829 26.4267916,31.1688871 26.6022095,23.1154196 Z"
                        fill="url(#linearGradient-69)"
                      />
                      <path
                        id="Path"
                        d="M74.767005,22.7345345 C73.8102566,20.430603 73.385035,17.6658851 74.1291727,15.1847281 C75.7591886,14.7593869 77.4246396,14.4049359 79.0546554,14.0504849 C79.5153121,13.9441496 79.9759687,13.8732594 80.4720605,13.8023692 C83.661222,13.2352476 86.8503835,12.8453515 90.07498,12.6326809 C97.4809217,12.1364495 106.339704,12.5263456 113.816515,15.3973987 C124.946577,19.4458329 130.329285,29.2209879 134.298019,39.6064024 C131.641359,41.7800984 120.312754,53.4831592 87.6299563,51.9412973 C86.3897268,41.0596515 78.664869,33.0490588 74.767005,22.7345345 Z"
                        fill="url(#linearGradient-70)"
                      />
                      <path
                        id="Path"
                        d="M89.4134446,71.222982 C89.7320793,70.7216669 90.0861179,70.2203518 90.4401565,69.7548449 C90.4401565,71.7601053 90.9712144,73.7653656 92.104138,75.5557767 C94.5824082,79.5304892 98.6184484,78.0623521 102.088027,76.5942151 C101.769392,77.1671466 101.379949,77.7042699 100.955103,78.205585 C100.140814,79.2082152 99.1141024,80.0318042 97.9811789,80.640544 C94.9718507,81.1776673 91.9625225,80.31827 90.1923295,77.4178041 C88.9885982,75.6990095 88.8115789,73.4072834 89.4134446,71.222982 Z"
                        fill="url(#linearGradient-71)"
                      />
                      <path
                        id="Path"
                        d="M92.0045059,75.883365 C90.9082106,74.1396188 90.3777451,72.186623 90.3423808,70.2336272 C90.6960244,69.7802531 91.0850325,69.361754 91.4740405,68.9781298 C93.8788173,66.6066349 96.7786953,65.2465129 99.8907594,63.8863908 C100.739504,63.5376415 101.623613,63.1888923 102.543087,63.3632669 C103.604018,63.5725164 104.346669,64.5490143 104.664949,65.5603872 C105.230779,67.513383 104.382034,69.6058785 103.993026,71.5239994 C103.604018,73.4072453 103.002824,75.2556164 102.012621,76.8947379 C98.5115492,78.3246098 94.4800115,79.7196068 92.0045059,75.883365 Z"
                        fill="url(#linearGradient-72)"
                      />
                      <path
                        id="Path"
                        d="M122.991013,20.4203454 C123.063459,20.4908254 123.172128,20.5613054 123.244573,20.6317854 C123.425687,20.8079853 123.606802,20.9841853 123.787916,21.1603852 C123.932807,21.3013451 124.077698,21.4423051 124.22259,21.5832651 C118.86161,28.7017426 120.238078,37.2650597 124.077698,45.1588171 C123.425687,45.440737 122.809899,45.7226569 122.157888,46.0045768 C118.644273,37.4060197 117.557588,28.3493428 122.991013,20.4203454 Z"
                        fill="url(#linearGradient-73)"
                      />
                      <path
                        id="Path"
                        d="M134.023524,50.0411986 C133.032102,52.0346899 131.686599,53.81834 130.093241,55.3921489 C127.756316,52.2445311 125.525614,48.7821514 123.790624,45.1449041 C127.402236,43.5011482 131.084664,41.6125774 134.44842,39.3392979 C135.546067,42.8716246 135.758514,46.5438454 134.023524,50.0411986 Z"
                        fill="url(#linearGradient-74)"
                      />
                      <path
                        id="Path"
                        d="M129.837498,55.0515393 C129.14431,55.7681844 128.416463,56.4489973 127.653956,57.0939779 C125.470414,53.4032555 123.39085,49.4617073 121.831176,45.4126622 C122.420386,45.1260042 123.044256,44.8393461 123.668125,44.5526881 C125.366435,48.2434105 127.549978,51.8266362 129.837498,55.0515393 Z"
                        fill="#000000"
                      />
                      <path
                        id="Path"
                        d="M124.269801,21.3663788 C127.358343,24.5382566 129.736877,28.379753 131.831406,32.2564925 C133.002922,34.4063208 134.103437,36.7323645 134.813447,39.0936513 C131.4054,41.384452 127.748849,43.2875787 124.127799,44.9440037 C120.364746,37.0143092 119.015727,28.4854823 124.269801,21.3663788 Z"
                        fill="url(#linearGradient-75)"
                      />
                      <path
                        id="Path"
                        d="M122.222053,45.6412522 C123.809845,49.7002949 125.926902,53.6515753 128.149811,57.3514107 C126.844293,58.3931119 125.468206,59.3629716 124.056835,60.1891485 C120.95182,56.6329961 118.72891,52.2506668 117.141118,47.6528132 C118.481921,47.1858437 119.787439,46.6829534 121.092957,46.1441425 C121.445799,46.0004595 121.833926,45.8208559 122.222053,45.6412522 Z"
                        fill="url(#linearGradient-76)"
                      />
                      <path
                        id="Path"
                        d="M116.869694,16.4945655 C119.024375,17.5163241 121.035411,18.8199471 122.795067,20.3702016 C122.86689,20.4406677 122.938713,20.4759007 123.010535,20.5463668 C117.659743,28.4738042 118.701173,37.5286994 122.184574,46.1255649 C121.789549,46.3017301 121.394524,46.4778954 121.035411,46.6188276 C119.706691,47.1473235 118.342059,47.6405862 117.013339,48.098616 C116.079644,45.5266029 115.361417,42.8841238 114.786835,40.2768777 C113.06309,32.5608386 112.488508,23.4707104 116.869694,16.4945655 Z"
                        fill="url(#linearGradient-77)"
                      />
                      <path
                        id="Path"
                        d="M116.550236,48.1541861 C118.273485,52.6307982 120.594595,56.8625955 123.302556,60.7796311 C123.233686,60.8138752 119.202953,63.2362661 113.40077,65.0851305 C106.402272,67.3933836 99.0872589,68.6874043 91.5964043,68.8622719 C90.189671,68.8972455 88.2901448,68.9843564 86.8834115,68.9493828 C89.2748581,63.9481678 88.6066598,58.0726145 88.1494714,52.5467965 C88.1143031,52.3369553 88.1143031,52.1620876 88.0791348,51.9522464 C97.328406,52.5118229 107.898827,50.8121746 116.550236,48.1541861 Z"
                        fill="url(#linearGradient-78)"
                      />
                      <path
                        id="Path"
                        d="M124.349015,60.0715248 C124.067801,60.2449682 123.838028,60.465623 123.556814,60.6043777 C123.41867,60.6801133 123.264434,60.7442477 123.108159,60.8040243 C122.906547,60.881143 122.701541,60.9510086 122.52332,61.0291748 C119.816637,57.1440433 117.621411,53.0683958 115.898976,48.6282455 C116.426252,48.4548022 116.953528,48.2813588 117.515956,48.1079154 C119.097783,52.5827544 121.255663,56.6373461 124.349015,60.0715248 Z"
                        fill="#000000"
                      />
                      <path
                        id="Path"
                        d="M115.815304,16.0651043 C115.923135,16.1001659 116.066909,16.1702893 116.17474,16.205351 C116.57012,16.3806593 116.9655,16.5559677 117.360879,16.731276 C112.97576,23.6734868 113.586801,32.6843361 115.240207,40.362842 C115.815304,42.9574056 116.534176,45.5870309 117.46871,48.1465329 C116.929556,48.3218412 116.390402,48.4971496 115.815304,48.6724579 C111.789621,38.4344501 110.926974,27.0744688 115.815304,16.0651043 Z"
                        fill="url(#linearGradient-79)"
                      />
                      <path
                        id="Path"
                        d="M88.3912926,52.3817493 C88.8606977,58.0087946 89.6422763,63.9043788 87.1869264,68.9972109 C87.0424941,68.9972109 86.9341698,68.9972109 86.7897375,68.9972109 C86.3203324,68.9972109 85.8870353,68.9615967 85.4176302,68.9615967 C85.0926575,68.9615967 84.7676847,68.9259825 84.4427119,68.9259825 C86.0675758,63.263323 86.1886993,57.403353 85.2859972,51.5270083 C86.2970236,51.6338509 87.2211573,51.2110489 88.2321837,51.2822774 C88.2321837,51.4603484 88.3551845,52.1680641 88.3912926,52.3817493 Z"
                        fill="#000000"
                      />
                      <path
                        id="Path"
                        d="M72.8698487,15.545703 C73.4364632,15.4040374 74.0030776,15.2269554 74.569692,15.0852897 C73.8260106,17.5998547 74.2863848,20.3269182 75.2071333,22.6289847 C79.0671942,32.8997432 86.7873159,40.939268 88.0976118,51.7058561 C87.1060365,51.6350233 86.1144613,51.5641905 85.122886,51.4579413 C84.6625118,48.4475466 83.9542437,45.4725682 82.9626684,42.5330063 C79.8108756,33.4309893 70.8866982,25.4977138 72.8698487,15.545703 Z"
                        fill="url(#linearGradient-80)"
                      />
                      <path
                        id="Path"
                        d="M85.4418429,51.4103455 C86.2935404,57.3016276 86.0806161,63.2286144 84.5191706,68.8699633 C78.4508256,68.5486206 72.3824806,67.6560022 66.4205977,66.3706315 C66.9174213,65.1923751 67.2722953,63.9784139 67.2368079,62.6573386 C67.2368079,58.0514271 67.2368079,53.3741062 66.9529087,48.8038995 C71.885657,49.3037659 76.8184053,50.1249749 81.7511535,50.9461839 C82.9577251,51.1604123 84.199784,51.3032313 85.4418429,51.4103455 Z"
                        fill="url(#linearGradient-81)"
                      />
                      <path
                        id="Path"
                        d="M60.2630788,25.4276634 C59.4807352,24.1136026 58.5561472,22.7995418 57.489315,21.5920265 C62.5034265,19.1414806 67.7664655,17.1171167 73.1361878,15.6254801 C71.1447676,25.6052392 80.1417194,33.5606344 83.3066551,42.723545 C84.3023651,45.671303 85.0491477,48.6900914 85.5114417,51.7443949 C84.2668041,51.6378494 83.0221665,51.4957888 81.7775289,51.318213 C76.8345395,50.4658492 71.8559891,49.6845158 66.9485608,49.1873036 C66.3795836,40.7346962 64.8148963,32.56621 60.2630788,25.4276634 Z"
                        fill="url(#linearGradient-82)"
                      />
                      <path
                        id="Path"
                        d="M67.5027031,62.4218237 C67.5392866,63.7315794 67.1734511,64.9351386 66.6612812,66.1032991 C66.2954457,66.0325015 65.9296101,65.9617039 65.5271909,65.8555075 C65.4540238,65.8555075 65.3808567,65.8201087 65.3076896,65.8201087 C65.0516047,65.7493111 64.7955198,65.7139123 64.5028513,65.6431147 C65.5637745,60.0855028 66.0027772,54.2447004 65.6369416,48.5454933 C66.1491114,48.5808921 66.6612812,48.6516897 67.1368675,48.6870885 C67.5027031,53.2181352 67.5027031,57.8553782 67.5027031,62.4218237 Z"
                        fill="#000000"
                      />
                      <path
                        id="Path"
                        d="M56.0967258,22.1304195 C56.5987509,21.8818534 57.064917,21.6332872 57.5669421,21.3847211 C58.6427101,22.5565328 59.5750424,23.9058916 60.3639389,25.2197411 C64.9538824,32.3571392 66.5316755,40.5243113 67.1054184,48.9755589 C66.6033934,48.9400494 66.1013683,48.8690305 65.6352022,48.8335211 C65.0256003,39.139443 62.1927445,29.693931 56.0967258,22.1304195 Z"
                        fill="url(#linearGradient-83)"
                      />
                      <path
                        id="Path"
                        d="M43.756408,38.5892317 C41.7414186,36.3414084 38.6537899,35.8705219 35.8257346,35.3788106 C36.6388005,34.9573437 38.0710638,34.3859047 38.7780776,33.8941934 C42.9494591,31.0141698 46.9087364,27.501946 51.18617,24.9380226 C51.2922221,24.8677781 51.4336248,24.7975336 51.5396769,24.7272891 C51.8224824,24.5868002 52.0699372,24.411189 52.3527428,24.2707 C52.6355483,24.1302111 52.8830031,23.9545999 53.1658086,23.8141109 C54.1202773,23.2872773 55.1100966,22.7604438 56.099916,22.2336102 C62.1095333,29.714647 65.6121074,37.7821478 65.5031996,48.6455335 C59.5289329,48.0835777 53.4768991,47.8714469 47.5733338,48.6792584 C47.7479126,45.9734819 45.7713973,40.8370549 43.756408,38.5892317 Z"
                        fill="url(#linearGradient-84)"
                      />
                      <path
                        id="Path"
                        d="M65.622701,48.448745 C65.9749,54.163544 65.5170413,59.98483 64.5308839,65.5931421 C64.4252242,65.5576465 64.3195644,65.5576465 64.2139047,65.5221508 C61.7837312,64.9542205 59.3535577,64.3152989 56.958604,63.6053859 C54.3875509,62.8599774 51.4290788,61.7596123 48.3649469,60.8722212 C47.9070882,60.7302386 47.4844493,60.6237516 47.0265905,60.4817691 C45.7586739,60.1268126 44.4907573,59.8428474 43.2228406,59.6653692 C45.7938938,56.5062567 46.8386474,52.6576175 47.1556266,48.7530964 C53.002131,47.9012009 59.6353169,47.9163103 65.622701,48.448745 Z"
                        fill="url(#linearGradient-85)"
                      />
                      <path
                        id="Path"
                        d="M43.0744292,59.8753662 C42.071333,59.6979332 41.1028263,59.5914734 40.1343196,59.5559868 C42.6247654,56.5041385 44.4234206,52.9554777 45.0114425,49.3003571 C45.8761807,49.122924 46.7755083,48.9809776 47.6402464,48.8390312 C47.3289407,52.7780446 45.5994645,56.7170581 43.0744292,59.8753662 Z"
                        fill="#000000"
                      />
                      <path
                        id="Path"
                        d="M44.3262541,42.4446881 C42.9622807,38.0794392 38.3807288,37.1289414 33.9740454,36.2488509 C34.77844,35.9320183 35.5828346,35.5447785 36.3522555,35.1575386 C39.1501498,35.6503893 41.8780967,36.2840545 43.8715963,38.5370862 C46.7394379,41.4589868 47.8055936,45.5789901 47.5258042,49.2401666 C46.6164886,49.3809811 45.7421466,49.5217956 44.8678046,49.6978137 C45.1825677,47.4095783 44.990754,44.6625162 44.3262541,42.4446881 Z"
                        fill="url(#linearGradient-86)"
                      />
                      <path
                        id="Path"
                        d="M45.2256952,49.3391547 C44.6226875,53.0408943 42.8136641,56.6348161 40.2242777,59.725589 C37.4575361,59.6177713 34.3393266,60.2714544 31.9272954,61.5652663 C31.9272954,59.1213994 31.5967403,56.6540665 30.9227904,54.1742604 C33.1929374,53.2039015 35.7549259,52.0345961 38.0605439,51.2079941 C40.437104,50.4173313 42.8136641,49.8063646 45.2256952,49.3391547 Z"
                        fill="url(#linearGradient-87)"
                      />
                      <path
                        id="Path"
                        d="M23.7108184,37.6721087 C26.9625801,38.3446859 31.1162341,37.4587085 34.2973053,36.2197505 C38.750805,37.1047205 43.3810309,38.0604882 44.7594951,42.4499396 C45.4310546,44.6800642 45.623983,47.4396179 45.2705306,49.6697424 C42.8670546,50.1299268 40.4989238,50.7317065 38.130793,51.5458789 C35.8333527,52.3600513 32.0928786,53.5771517 29.8307835,54.5329193 C29.4066407,53.0461696 28.9471526,51.5594199 28.4523193,50.0726703 C27.0738551,45.9310104 26.2910206,41.1057925 23.7108184,37.6721087 Z"
                        fill="url(#linearGradient-88)"
                      />
                      <path
                        id="Path"
                        d="M32.1369844,61.519873 C31.5114905,61.8423633 30.8859966,62.2365181 30.2605027,62.7023375 C30.370884,59.979086 30.1501215,57.2916667 29.6350088,54.675912 C30.076534,54.4967507 30.4812653,54.3534217 30.9227904,54.1742604 C31.6218718,56.6108538 32.1369844,59.0832796 32.1369844,61.519873 Z"
                        fill="#000000"
                      />
                      <path
                        id="Path"
                        d="M24.2247632,37.7516572 C26.7394299,41.213648 28.220672,45.6035952 29.5296766,49.8150892 C30.0119415,51.2784049 30.4597589,52.7774112 30.8731287,54.3121082 C30.4597589,54.4905614 30.0808365,54.6690145 29.6674666,54.811777 C28.4618044,48.2090109 25.5337678,41.9988418 21.3656215,36.7523196 C22.2957037,37.1806071 23.2602334,37.5375134 24.2247632,37.7516572 Z"
                        fill="url(#linearGradient-89)"
                      />
                      <path
                        id="Path"
                        d="M29.9318763,54.1472049 C30.424754,56.7637489 30.7727151,59.8198963 30.6670984,62.471799 C29.8925763,63.072897 29.1532598,63.7447123 28.4843543,64.5579625 C26.7240768,66.5734085 24.1095471,68.9804279 22.1380363,70.7130043 C18.9343312,70.3240586 15.692223,68.5071245 13.7207121,66.1380914 C11.7139958,63.7336996 9.90096344,60.8159196 10.0076241,58.1786 C16.9431175,59.5575894 23.454055,56.7991076 29.9318763,54.1472049 Z"
                        fill="url(#linearGradient-90)"
                      />
                      <path
                        id="Path"
                        d="M14.2437831,34.1418017 C15.0648726,33.469999 16.1001594,33.399283 17.1711456,33.6467892 C17.6352397,34.0710857 18.0636342,34.4600241 18.5277283,34.8843205 C18.5277283,35.0257526 18.5277283,35.1318267 18.4206297,35.2379009 C18.4920287,35.1318267 18.5277283,35.0257526 18.5277283,34.8843205 C18.8133246,35.1318267 19.1346205,35.379333 19.4559164,35.6268393 C20.0271091,36.0511357 20.5983018,36.404716 21.205194,36.7229384 C25.5248388,41.9205697 28.5592999,48.108226 29.8087839,54.6141047 C23.240068,57.2659574 16.671352,59.5642298 9.60284249,58.1852664 C6.42558314,49.9114859 7.10387446,40.258742 14.2437831,34.1418017 Z"
                        fill="url(#linearGradient-91)"
                      />
                      <path
                        id="Path"
                        d="M0.205221049,52.7633113 C-0.0724483199,47.3117496 1.17706384,41.7898452 3.84963151,37.0768822 C4.50909627,35.8810558 5.27268703,34.7555721 6.14040381,33.7004311 C7.38991597,32.152891 8.95180617,30.6756937 10.8954917,30.4646655 C12.2838386,30.32398 13.5333508,30.8163791 14.6787369,31.6253205 C13.8804375,31.5549778 13.082138,31.5198064 12.2491299,31.8715201 C9.47243623,32.7508042 7.1122466,34.8962576 6.10569514,37.4285959 C3.88434019,43.4428994 3.22487543,50.1606303 4.71734829,56.5266474 C3.01662341,55.5418492 1.42002454,54.3108514 0.205221049,52.7633113 Z"
                        fill="url(#linearGradient-92)"
                      />
                      <path
                        id="Path"
                        d="M4.61181575,56.3835222 C5.13396718,58.5239799 5.89978928,60.6293482 6.94409214,62.6645375 C8.92826756,66.9103634 11.643455,71.2965472 16.0643371,73.2615576 C13.8713011,73.3317365 11.6086449,72.7001261 9.69408966,71.5421735 C6.94409214,69.8929684 4.89029652,67.2963476 3.32384223,64.4891899 C1.3396668,60.8749745 0.26055385,56.8045959 0.0516932784,52.6991278 C1.30485671,54.278154 2.90612109,55.5062854 4.61181575,56.3835222 Z"
                        fill="url(#linearGradient-93)"
                      />
                      <path
                        id="Path"
                        d="M10.1412562,57.8804654 C11.2562565,60.9300065 12.7721768,63.2727585 14.7582712,65.6840235 C16.7095218,68.0598288 19.7409289,69.5136798 22.8768674,69.9037374 C21.7618671,70.8966112 20.1712789,72.3287872 18.7426847,72.8252241 C17.8367469,73.1443621 16.8611216,73.321661 15.9203401,73.3571208 C11.4951825,71.3359134 8.69047645,66.4094105 6.70438209,62.1542369 C5.65906927,60.0975696 4.89250653,57.9699828 4.36985012,55.8069362 C5.4500067,56.3742927 7.1795365,57.1712698 8.36422436,57.454948 C8.99141206,57.6322469 9.58375599,57.774086 10.1412562,57.8804654 Z"
                        fill="#000000"
                      />
                      <path
                        id="Path"
                        d="M6.15482102,37.2383383 C7.17747005,34.7023765 9.57540573,32.5538534 12.3965065,31.6733111 C13.207573,31.3210942 14.0539032,31.3915376 14.8649697,31.4267593 C15.7465637,32.025528 16.592894,32.8004052 17.4392242,33.5752824 C16.3813114,33.3287306 15.3586624,33.3639523 14.5475959,34.0683861 C7.49484389,40.1617386 6.86009621,49.7772603 9.96330709,57.9839143 C9.36382317,57.8782492 8.79960301,57.7373624 8.20011909,57.561254 C7.03641501,57.2794804 5.87271094,56.8568202 4.74427062,56.3284948 C3.22792894,50.0238121 3.89794038,43.2612474 6.15482102,37.2383383 Z"
                        fill="url(#linearGradient-94)"
                      />
                      <path
                        id="Path"
                        d="M90.8091859,24.915816 C91.6846995,24.9509068 92.5952337,25.056179 93.4357268,25.2667236 C99.3541988,26.6703538 106.673493,31.0216075 108.179376,37.3028528 C110.070486,45.0579098 103.171438,52.918239 95.8871649,54.6727768 C93.8909939,55.1289567 91.7897612,55.1289567 89.7935901,54.6727768 C87.6923574,52.0760609 86.2214946,48.9880744 85.3109604,45.6895434 C83.7350359,38.8117553 83.805077,28.6003454 90.8091859,24.915816 Z"
                        fill="url(#linearGradient-95)"
                      />
                      <path
                        id="Path"
                        d="M82.6879183,31.0365941 C83.2163116,29.1206565 84.4140029,26.9918369 86.0696351,25.4307025 C87.7252673,24.8275369 89.5218043,24.5791747 91.2831152,24.6501353 C84.2378719,28.3400893 84.1674194,38.7003447 85.7525992,45.6544888 C86.6684808,48.9896395 88.1479819,52.1119083 90.2615549,54.7374524 C88.8525062,54.4181295 87.51391,53.8859246 86.3162186,53.1763181 C85.8582778,52.6086328 85.4707894,52.0054673 85.1185273,51.3668214 C81.983394,45.0868035 80.7857026,37.423053 82.6879183,31.0365941 Z"
                        fill="url(#linearGradient-96)"
                      />
                      <path
                        id="Path"
                        d="M81.4149619,28.9635651 C82.5815858,27.199445 84.3491978,25.964561 86.3289233,25.2236305 C84.667368,26.7407738 83.4653918,28.8930003 82.9351082,30.7982499 C81.0260873,37.1490821 82.2280634,44.7347984 85.409765,51.0150658 C85.7632874,51.650149 86.1521621,52.2499498 86.6117412,52.8144683 C85.1976516,51.9676906 83.9249709,50.8386538 82.9704605,49.4979225 C81.132144,46.8870249 80.4604514,43.6763264 80.0008723,40.5361927 C79.3998842,36.5845637 79.223123,32.2801108 81.4149619,28.9635651 Z"
                        fill="url(#linearGradient-97)"
                      />
                      <ellipse
                        id="Oval"
                        cx="126.749718"
                        cy="34.3610292"
                        fill="#000000"
                        rx="3.75296339"
                        ry="3.76238696"
                      />
                      <ellipse
                        id="Oval"
                        cx="125.010661"
                        cy="33.1402707"
                        fill="#FFFFFF"
                        rx="1.2509878"
                        ry="1.25412899"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g id="Oval" transform="translate(386.297381, 84.753467)">
                <circle
                  cx="7.58320493"
                  cy="4.0146379"
                  fill="#D8D8D8"
                  opacity="0.793252854"
                  r="1.33821263"
                />
                <circle
                  cx="5.35285054"
                  cy="5.35285054"
                  fill="url(#linearGradient-109)"
                  fillRule="nonzero"
                  r="5.35285054"
                />
                <circle
                  cx="5.35285054"
                  cy="5.35285054"
                  fill="url(#linearGradient-110)"
                  fillRule="nonzero"
                  opacity="0.16499038"
                  r="5.35285054"
                  transform="translate(5.352851, 5.352851) rotate(180.000000) translate(-5.352851, -5.352851) "
                />
              </g>
              <g id="Oval" transform="translate(380.944530, 156.124807)">
                <circle
                  cx="7.58320493"
                  cy="4.0146379"
                  fill="#D8D8D8"
                  opacity="0.793252854"
                  r="1.33821263"
                />
                <circle
                  cx="5.35285054"
                  cy="5.35285054"
                  fill="url(#linearGradient-109)"
                  fillRule="nonzero"
                  r="5.35285054"
                />
                <circle
                  cx="5.35285054"
                  cy="5.35285054"
                  fill="url(#linearGradient-110)"
                  fillRule="nonzero"
                  opacity="0.16499038"
                  r="5.35285054"
                  transform="translate(5.352851, 5.352851) rotate(180.000000) translate(-5.352851, -5.352851) "
                />
              </g>
              <g id="Oval" transform="translate(396.110940, 191.810478)">
                <circle
                  cx="11.3748074"
                  cy="6.02195686"
                  fill="#D8D8D8"
                  opacity="0.793252854"
                  r="2.00731895"
                />
                <circle
                  cx="8.02927581"
                  cy="8.02927581"
                  fill="url(#linearGradient-109)"
                  fillRule="nonzero"
                  r="8.02927581"
                />
                <circle
                  cx="8.02927581"
                  cy="8.02927581"
                  fill="url(#linearGradient-110)"
                  fillRule="nonzero"
                  opacity="0.16499038"
                  r="8.02927581"
                  transform="translate(8.029276, 8.029276) rotate(180.000000) translate(-8.029276, -8.029276) "
                />
              </g>
              <g id="Oval" transform="translate(449.639445, 49.067797)">
                <circle
                  cx="11.3748074"
                  cy="6.02195686"
                  fill="#D8D8D8"
                  opacity="0.793252854"
                  r="2.00731895"
                />
                <circle
                  cx="8.02927581"
                  cy="8.02927581"
                  fill="url(#linearGradient-109)"
                  fillRule="nonzero"
                  r="8.02927581"
                />
                <circle
                  cx="8.02927581"
                  cy="8.02927581"
                  fill="url(#linearGradient-110)"
                  fillRule="nonzero"
                  opacity="0.16499038"
                  r="8.02927581"
                  transform="translate(8.029276, 8.029276) rotate(180.000000) translate(-8.029276, -8.029276) "
                />
              </g>
              <g
                id="Fish4"
                fillRule="nonzero"
                transform="translate(468.374422, 122.223421)"
              >
                <g id="Fish1">
                  <path
                    id="Path"
                    d="M93.6366498,18.2954901 C92.9029087,18.8396636 91.9998428,19.3275434 90.9838936,19.7966585 C78.1528317,18.2204317 68.3696173,11.3901154 53.657168,5.7607338 C42.0113801,1.29475776 32.0964687,1.55746223 26.979095,2.1766942 L24.890755,1.21969934 C24.890755,1.21969934 38.2109776,-2.42063407 55.3316028,4.12821315 C70.3827018,9.92647616 80.2976133,16.9632031 93.6366498,18.2954901 Z"
                    fill="url(#linearGradient-111)"
                  />
                  <path
                    id="Path"
                    d="M90.9650797,19.7966585 C84.9258262,22.5362909 74.9544731,23.9436362 74.9544731,23.9436362 L26.9414672,2.1766942 C32.0588409,1.55746223 41.9737524,1.29475776 53.6195403,5.7607338 C68.3508034,11.3901154 78.1340178,18.2204317 90.9650797,19.7966585 Z"
                    fill="url(#linearGradient-112)"
                  />
                  <path
                    id="Path"
                    d="M92.0374705,39.2930833 C82.9691834,45.1476401 76.8358605,51.2649014 65.6416056,50.7207279 C54.4473507,50.1953189 35.7463602,42.4830662 35.7463602,42.4830662 L36.0850099,42.4267724 C41.9361247,44.6409958 54.3909091,48.9943842 62.7066413,49.3884409 C73.8820823,49.9138499 79.9965913,43.8341178 89.0272507,37.9983256 C90.0996415,38.3548531 91.1155907,38.786439 92.0374705,39.2930833 Z"
                    fill="url(#linearGradient-113)"
                  />
                  <path
                    id="Path"
                    d="M89.0460646,38.0170902 C80.0154052,43.8528824 73.8820823,49.9326145 62.7254552,49.4072055 C54.409723,49.0131488 41.9549385,44.6597604 36.1038238,42.445537 L75.5188893,36.5159217 C75.5000755,36.5159217 83.025625,36.028042 89.0460646,38.0170902 Z"
                    fill="url(#linearGradient-114)"
                  />
                  <path
                    id="Path"
                    d="M38.5872551,33.7199956 C55.7831358,36.5159217 72.3017169,34.1140523 89.3659004,32.2563564 C92.0374705,31.9936519 94.4268325,31.3181261 97.0984026,30.9240694 C101.707802,30.2485436 105.884482,28.8224336 110.061162,27.283736 C109.42149,24.6003974 108.386727,22.5175263 108.029263,22.2735864 C103.438678,23.0241706 100.82355,28.3908477 88.0301154,27.3212652 C86.4685639,27.189913 85.0387095,26.9084439 83.7217383,26.476858 C81.5957706,25.8013322 79.6955693,24.7692789 77.7765542,23.4557565 C77.7765542,23.4557565 77.7765542,23.4557565 77.7765542,23.4557565 C71.1164429,18.9522513 64.249379,11.2399985 46.9782428,4.05315473 C21.6547687,-6.4737888 11.175441,6.54884722 3.64989151,15.4057409 C2.42698972,16.8318509 1.54273765,18.2391963 0.940693689,19.5902478 C1.61799314,20.0968922 2.31410647,20.5847719 2.99140593,21.1101809 C13.8093834,29.1977257 25.7938209,31.7309474 38.5872551,33.7199956 Z"
                    fill="url(#linearGradient-115)"
                  />
                  <path
                    id="Path"
                    d="M97.0984026,30.9240694 C94.4268325,31.3181261 92.0374705,31.9936519 89.3659004,32.2563564 C72.3017169,34.1140523 55.7831358,36.5159217 38.5872551,33.7199956 C25.7938209,31.7309474 13.7905695,29.1977257 3.0102198,21.0914163 C2.33292035,20.5847719 1.63680702,20.0781276 0.959507563,19.5714832 C-5.39958177,34.0577585 22.1063017,43.8341178 41.1271281,47.0053361 C61.9164586,50.4580234 74.973287,41.1507792 81.1066099,36.4971571 C81.2947486,36.3470403 81.4828873,36.2156881 81.6898399,36.1031004 C82.7434169,35.4275746 83.9475048,34.9584595 85.2456621,34.6769904 C91.7176347,33.2321158 100.879991,35.934219 108.83826,37.4353874 C111.001855,34.5456382 110.813717,30.4924835 110.061162,27.283736 C105.884482,28.8411982 101.688988,30.2673082 97.0984026,30.9240694 Z"
                    fill="url(#linearGradient-116)"
                  />
                  <path
                    id="Path"
                    d="M108.819446,37.4353874 C100.861177,35.934219 91.6988208,33.2321158 85.2268482,34.6769904 C83.9286909,34.9772241 82.724603,35.4275746 81.6710261,36.1031004 C54.5226062,33.4197619 46.2633156,33.1007636 36.7246816,27.0022669 C26.7345146,20.6223011 35.332455,10.9022356 24.8531273,10.9022356 C21.1467941,10.9022356 13.3390365,14.6363921 15.3333071,10.9022356 C17.3275777,7.16807919 22.9341121,4.07191933 31.8707022,4.39091762 C40.8072922,4.70991591 52.5095217,9.26971497 59.2448885,13.6043388 C65.9238137,17.9014334 77.6072293,23.3994627 77.7765542,23.4557565 C77.7765542,23.4557565 77.7765542,23.4557565 77.7765542,23.4557565 C79.6955693,24.7505143 81.5957706,25.7825676 83.7217383,26.476858 C85.0575233,26.9084439 86.4685639,27.189913 88.0301154,27.3212652 C100.82355,28.3908477 103.419864,23.0241706 108.029263,22.2735864 C108.819446,22.8177599 112.826801,32.1250041 108.819446,37.4353874 Z"
                    fill="url(#linearGradient-117)"
                  />
                  <path
                    id="Path"
                    d="M109.835395,35.6527499 C111.26525,32.1437687 110.362184,27.7528511 109.383862,24.9756895 C104.266488,28.6910814 98.1519795,29.0851381 92.1879815,29.2164903 C88.1806264,29.3290779 84.1544574,28.9725504 80.2976133,27.7716157 L73.3929216,30.2860728 L83.7405522,34.1328169 C87.0141662,32.9318821 90.927452,33.1570574 94.3139492,33.0632344 C99.6006478,32.7630007 104.830905,33.8325832 109.835395,35.6527499 Z"
                    fill="url(#linearGradient-118)"
                  />
                  <g id="Group" transform="translate(11.100186, 9.569949)">
                    <ellipse
                      id="Oval"
                      cx="3.91328575"
                      cy="3.82797946"
                      fill="#000000"
                      rx="3.81921638"
                      ry="3.80921486"
                    />
                    <ellipse
                      id="Oval"
                      cx="5.36195403"
                      cy="2.38310486"
                      fill="#FFFFFF"
                      rx="1.18527405"
                      ry="1.18217013"
                    />
                  </g>
                  <g id="Group" transform="translate(18.813874, 17.263437)">
                    <path
                      id="Path"
                      d="M8.71082356,4.72868051 C9.65151725,3.26504131 12.1725763,3.13368907 14.0351498,2.60828012 C17.0265558,2.00781276 19.9427062,1.97028355 22.8212289,1.55746223 C24.0817584,0.731819603 25.2670325,0.356527499 25.2670325,0.356527499 C24.1758278,0.713054998 22.4073237,0.356527499 21.2973051,0.337762894 C14.3549857,0.318998289 6.22739222,-0.956994866 0.0188138738,2.77716157 C1.63680702,4.35338841 3.36768341,5.57308775 5.19262916,6.51131801 C6.94231942,7.41201906 8.76726518,8.06878024 10.6486526,8.51913077 C9.23761202,7.37448985 7.99589636,6.1360259 8.71082356,4.72868051 Z"
                      fill="url(#linearGradient-119)"
                    />
                    <path
                      id="Path"
                      d="M22.8400428,1.53869763 C19.9615201,1.95151894 17.0265558,2.00781276 14.0539637,2.58951552 C12.1913902,3.11492447 9.65151725,3.2462767 8.72963743,4.70991591 C8.01471023,6.1172613 9.2564259,7.35572524 10.6674664,8.50036616 C13.9410805,9.30724418 17.4216471,9.56994866 21.015097,9.66377168 C18.3435269,5.53555854 20.6952612,2.92727841 22.8400428,1.53869763 Z"
                      fill="url(#linearGradient-120)"
                    />
                  </g>
                </g>
              </g>
              <g
                id="Group"
                fillRule="nonzero"
                transform="translate(0.000000, 74.047766)"
              >
                <g id="Fish3">
                  <path
                    id="Path"
                    d="M14.162476,46.0331601 C14.2259562,45.9703708 14.3105964,45.7401435 14.4587168,45.6773543 C15.1569986,45.028532 15.5378795,44.2332014 15.8764404,43.4169411 C17.5692447,41.7216312 19.0504485,39.8588833 20.0238109,38.4147304 C19.6006099,38.4147304 19.1774088,38.4775197 18.7753678,38.5612387 C19.240889,38.4147304 19.7064101,38.3310114 20.1719313,38.3728709 C21.6954552,48.1889245 26.710388,57.2724367 34.7935285,63.3420647 C34.0740867,63.2792755 33.3546448,63.2164862 32.635203,63.1327672 C30.5615177,62.9443994 28.4666724,62.6723127 26.4141472,62.2746474 C20.9125332,59.4072714 15.7706401,55.7236351 12.7870725,50.1353914 C11.9829905,48.6284493 12.9351929,47.1215072 14.162476,46.0331601 Z"
                    fill="url(#linearGradient-121)"
                  />
                  <path
                    id="Path"
                    d="M92.7827427,38.3620955 C92.6167628,38.7326775 92.3885405,39.1032595 92.1603182,39.4326656 C88.7784785,44.2914069 84.7119719,48.3266327 80.2097682,51.7442219 C79.7118286,49.5001422 79.4628588,47.173711 79.4006163,44.8678677 C84.1517899,43.2826005 88.6747411,41.1414602 92.7827427,38.3620955 Z"
                    fill="url(#linearGradient-122)"
                  />
                  <path
                    id="Path"
                    d="M74.9399076,46.9241782 C75.8614606,46.6763611 76.7830136,46.4078925 77.6849591,46.1187725 C78.3123995,45.9329096 78.9202323,45.7263953 79.5280652,45.4992296 C79.5868877,47.8121897 79.8221778,50.1664527 80.2927581,52.3968071 C79.4300276,53.0989557 78.5280821,53.7804528 77.6261366,54.4206471 C76.5085084,52.0044299 75.6065629,49.5056069 74.9399076,46.9241782 Z"
                    fill="url(#linearGradient-123)"
                  />
                  <path
                    id="Path"
                    d="M47.465669,49.6240481 C51.7276942,49.7274538 56.1374134,49.6447292 60.5682318,49.2931498 C65.3155371,48.900208 70.0839416,48.176368 74.7046522,47.0389051 C75.4220228,49.6240481 76.392583,52.1471476 77.6163328,54.5668414 C68.8812909,60.4402863 58.732607,64.4110659 48.6050223,67.8027735 C49.8920695,66.29305 51.1580176,64.8040076 52.4450648,63.2942841 C47.2757767,64.6385585 41.6634068,64.4731093 36.2620283,64.0388053 C29.1094215,58.9098816 24.3621162,50.6374241 24.0878274,41.9306626 C30.902848,47.0802674 39.0682132,49.3965555 47.465669,49.6240481 Z"
                    fill="url(#linearGradient-124)"
                  />
                  <path
                    id="Path"
                    d="M22.0793529,39.8579199 C22.8906009,40.607319 23.7226502,41.3150847 24.5755008,41.9812173 C24.866718,50.7450231 29.5469954,59.0924961 36.577812,64.2342065 C36.0161787,64.1925732 35.4545455,64.1301233 34.8929122,64.08849 C26.9468413,58.0516641 22.0377504,49.0172419 20.5192604,39.2542373 C21.0600924,39.3166872 21.5801233,39.504037 22.0793529,39.8579199 Z"
                    fill="url(#linearGradient-125)"
                  />
                  <path
                    id="Path"
                    d="M80.4793313,39.4878935 C80.6222033,35.4520141 82.1121542,31.5435835 83.520464,27.6563945 C83.9082594,28.2086727 84.3164652,28.718468 84.7654915,29.1857803 C86.9902127,31.5435835 89.7660117,33.5190403 92.2152461,35.6219459 C92.8683753,36.1742241 93.562325,36.8327097 93.6643765,37.7036099 C93.705197,38.0859564 93.6235559,38.4470614 93.4806839,38.8081664 C89.4394471,41.6970064 84.9900046,43.8848778 80.316049,45.4992296 C80.2548181,43.4812899 80.316049,41.4421087 80.4793313,39.4878935 Z"
                    fill="url(#linearGradient-126)"
                  />
                  <path
                    id="Path"
                    d="M73.3658566,29.407061 C73.8241499,25.2489047 75.6989859,21.6286193 77.0738657,17.8428351 C78.1571042,19.6633215 79.1986798,21.5044952 80.3027499,23.3042942 C81.1776734,24.7110337 81.9692708,26.2005225 82.9691834,27.5452 C81.5318091,31.3309841 80.0111088,35.1374556 79.8652882,39.0680512 C79.6986361,40.9505996 79.6361415,42.9572721 79.6778046,44.9639445 C78.0737782,45.5018155 76.4489203,45.9776244 74.7823994,46.3913713 C73.2825306,40.9299122 72.8450689,35.220205 73.3658566,29.407061 Z"
                    fill="url(#linearGradient-127)"
                  />
                  <path
                    id="Path"
                    d="M24.3099011,37.1005887 C25.0437012,32.8705261 26.5113013,28.9929687 28.7546329,25.5715945 C29.0900844,25.3227672 29.4465015,25.0532044 29.8029187,24.8043772 C33.6815762,21.9843354 37.1409193,19.1642937 41.2082682,16.9455843 C49.1542746,12.9228777 57.3099381,11.3055008 66.2622988,9.68812391 C67.0799617,9.68812391 68.0863161,9.08679147 68.5056304,8.48545904 C68.6523904,8.34030983 68.7781847,8.19516062 68.9249447,8.02927581 C69.4700533,8.48545904 69.9941962,8.96237786 70.4764077,9.41856109 C72.9922936,11.8860976 74.9211395,14.8098174 76.7241911,17.8164796 C75.3614195,21.6110946 73.4535394,25.2398248 72.9922936,29.4076807 C72.4681507,35.2343846 72.9084308,40.9574106 74.4179623,46.4108737 C65.5494644,48.629583 56.1568237,49.2516511 47.351223,49.0235595 C39.006868,48.7954678 30.8931359,46.4523449 24.100244,41.3099158 C24.0583125,39.9206305 24.1212097,38.5106096 24.3099011,37.1005887 Z"
                    fill="url(#linearGradient-128)"
                  />
                  <path
                    id="Path"
                    d="M4.47590268,27.2456807 C4.53791311,23.7449707 4.7652847,19.8921183 7.32838263,17.3235501 C7.57642436,17.0749789 7.92781682,16.9714076 8.29987942,16.9506934 C9.9121507,18.0071206 11.4210713,19.146405 13.2193738,20.0164039 C14.5422631,20.6585459 16.1338642,21.0521169 17.5807743,21.5906877 C18.2215488,22.1292584 18.965674,22.5849721 19.6271186,22.6678292 C18.6349517,24.5942554 17.8908265,26.6242529 17.5187639,28.8821072 C16.9399999,32.2171031 17.2087117,35.6556703 18.2215488,38.9078091 C15.9891732,39.694951 13.8394782,41.4349489 11.8344741,42.8228043 C11.0076684,42.6570902 10.2842133,42.2842336 9.85014026,41.68352 C7.14235133,38.0585245 5.09600701,34.0192437 4.62059369,29.6692491 C4.47590268,28.861393 4.43456239,28.0535368 4.47590268,27.2456807 Z"
                    fill="url(#linearGradient-129)"
                  />
                  <path
                    id="Path"
                    d="M17.6227935,22.1262136 C17.7694879,22.1679384 17.895226,22.2305255 18.0419205,22.2931127 C18.0419205,22.3556999 18.0628768,22.4182871 18.0628768,22.4808742 C17.9161824,22.3556999 17.7694879,22.2513879 17.6227935,22.1262136 Z"
                    fill="url(#linearGradient-130)"
                  />
                  <path
                    id="Path"
                    d="M19.8631209,14.9113546 C24.5376174,7.13442438 32.3423572,3.42223637 40.5018579,0.892141757 C44.8633301,1.20321896 49.2665389,1.68020401 53.6488795,1.82537338 C58.8450832,2.0120197 64.5003893,4.64580672 68.6949153,8.04691752 C58.7407418,2.24014299 46.1154274,0.912880237 35.6395467,7.71510183 C32.6971181,9.83042684 30.297265,11.9664903 27.8974118,14.3514156 C25.2262709,16.7363408 23.348125,19.9300668 20.9482718,22.5845923 C20.2596183,23.6007779 19.0283893,23.2067467 17.9432383,22.439423 C17.9432383,22.3772075 17.92237,22.3149921 17.92237,22.2527766 C18.4440773,22.4601615 18.9449162,22.6882847 19.4040185,22.957885 C19.0283893,22.7297617 18.5066821,22.4186845 17.9015018,22.0661303 C17.5884774,19.6397281 18.569287,17.1096335 19.8631209,14.9113546 Z"
                    fill="url(#linearGradient-131)"
                  />
                  <path
                    id="Path"
                    d="M11.4170325,9.64998979 C13.7153802,5.99134305 17.3300543,4.19302517 20.8402581,1.67124607 C21.8640676,1.34052094 22.887877,1.07180677 23.9325805,0.844433247 C29.0934159,-0.251093741 34.5676623,-0.106401497 40.146379,0.307004913 C31.9767976,2.82878402 24.1415212,6.50810107 19.4821436,14.2801416 C18.1867112,16.4711956 17.225584,18.9929747 17.4972069,21.4114022 C17.1211136,21.1840286 16.7032322,20.9153145 16.2644568,20.62593 C16.1808805,20.5225784 16.0973042,20.4398971 16.0137279,20.3365455 C16.0973042,20.4192268 16.1599864,20.5225784 16.2644568,20.62593 C14.1959438,19.3030295 11.6677613,17.5047116 9.95444754,15.6030421 C9.45298985,13.6393616 10.3723289,11.3449561 11.4170325,9.64998979 Z"
                    fill="url(#linearGradient-132)"
                  />
                  <path
                    id="Path"
                    d="M12.2652631,9.95916109 C11.2512787,11.6957931 10.3589725,14.0465999 10.8051256,16.0585516 C9.06107248,14.004243 8.18904592,11.8652206 9.68974279,10.0650533 C13.2386881,5.78700855 17.1932272,3.24559583 21.4114022,1.78428351 C18.0044147,4.36805311 14.5163084,6.21057733 12.2652631,9.95916109 Z"
                    fill="url(#linearGradient-133)"
                  />
                  <path
                    id="Path"
                    d="M0.890595584,22.2022015 C1.87164228,19.1734346 3.97984901,14.4714329 7.27783579,16.5894517 C7.52831579,16.7588932 7.7787958,16.9283347 8.02927581,17.076596 C7.6535558,17.076596 7.31958245,17.182497 7.04822911,17.4578394 C4.4599357,20.0841827 4.25120236,24.0236976 4.16770902,27.6031494 C4.14683569,28.4291767 4.18858235,29.255204 4.27207569,30.0600512 C2.89443565,30.3142134 1.53766894,30.7378172 0.201775562,31.2249615 C-0.194817784,28.1538343 -0.027831112,25.0615268 0.890595584,22.2022015 Z"
                    fill="url(#linearGradient-134)"
                  />
                  <path
                    id="Path"
                    d="M4.17096733,30.3328197 C4.66041758,34.7540502 6.76718169,38.8594786 9.55492006,42.5438374 C10.0018094,43.1543883 10.7679055,43.5333509 11.5978428,43.7017787 C11.0232708,44.1017948 10.4486988,44.4597039 9.87412674,44.7544526 C9.08675026,45.1755222 8.23553244,45.6176453 7.36303417,45.4702709 C6.44797501,45.3228966 5.7457203,44.5649713 5.19242872,43.8280996 C2.55365347,40.3753291 0.617132922,35.9540985 0,31.4697076 C1.38322896,30.9854776 2.76645792,30.5854615 4.17096733,30.3328197 Z"
                    fill="url(#linearGradient-135)"
                  />
                  <path
                    id="Path"
                    d="M8.97654875,48.705395 C9.16269914,48.2479371 9.70046693,48.1231759 10.1761846,47.9984147 C12.2238389,47.4577827 14.4783269,45.7111256 16.4639311,43.7149461 C16.1329971,44.525894 15.7606963,45.3160484 15.0781449,45.9606481 C14.9333612,46.0230287 14.8713111,46.2517576 14.7885776,46.3141382 C13.5682584,47.3954021 12.6581898,48.8925368 13.4441581,50.3896715 C16.3605142,55.9415459 21.3865748,59.6012084 26.7642527,62.449923 C23.6824296,61.8261168 20.6626566,60.8488206 17.9324509,59.1853376 C14.2714932,56.9396356 11.1896701,53.6126697 9.18338252,49.8074524 C8.99723213,49.4747558 8.83176511,49.0796786 8.97654875,48.705395 Z"
                    fill="#00206A"
                  />
                  <path
                    id="Path"
                    d="M58.8658805,10.097815 C57.9539782,13.0377935 57.1636629,16.0197717 56.393612,19.0017498 C55.6235612,21.983728 54.9143038,24.9867061 54.3874269,28.0316838 C53.3336732,33.9536404 52.9689122,39.9805963 53.6781696,45.9655526 C53.86055,47.6035406 54.144253,49.2205287 54.4887494,50.8375169 C54.6508654,51.6355111 54.8737748,52.4125054 55.0561553,53.2104995 C55.1574778,53.6094966 55.2385358,54.0294935 55.3398582,54.4284906 C55.4411807,54.8694874 55.4817097,55.2894843 55.5627677,55.7304811 C55.6438257,56.1294782 55.1169488,56.4024762 54.9143038,56.024479 C54.7319234,55.7094813 54.5090139,55.4154834 54.3671624,55.0794859 C54.225311,54.7224885 54.063195,54.3864909 53.9213435,54.0294935 C53.6376406,53.3154988 53.4147311,52.5805042 53.2120862,51.8245097 C52.8067963,50.3755203 52.5028288,48.9265309 52.2799194,47.4355418 C51.8341005,44.4115639 51.6719845,41.3455864 51.773307,38.2796088 C51.9556874,32.0636543 53.1107637,25.8686996 54.8940393,19.9257431 C55.4006517,18.2667552 55.9275286,16.6077674 56.515199,14.9697793 C57.1231339,13.2897916 57.7918623,11.6308038 58.4403261,9.97181591 C58.5416486,9.69881791 58.967203,9.80381714 58.8658805,10.097815 L58.8658805,10.097815 Z"
                    fill="#00206A"
                  />
                  <path
                    id="Path"
                    d="M56.1893136,7.41383353 C54.758162,10.4586573 53.5471876,13.5656204 52.5123549,16.7554357 C51.4995399,19.924538 50.640849,23.1350665 50.0463706,26.4077343 C48.8794316,32.8702174 48.7253076,39.4776921 49.4518923,46.0023145 C49.6500517,47.8043531 49.936282,49.6063917 50.2665478,51.3877171 C50.4206718,52.319806 50.5968135,53.251895 50.7729553,54.1839839 C50.8610261,54.6189587 50.9270793,55.0746466 50.9931324,55.5096214 C51.0591856,55.9860224 51.1472564,56.4417103 51.1692742,56.9181113 C51.1912919,57.1045291 50.9050616,57.1666684 50.8169907,57.0009637 C50.3766364,56.2552926 50.1124238,55.4474822 49.782158,54.681098 C49.47391,53.9354268 49.2537328,53.1069033 49.0335556,52.3405191 C48.5932013,50.7248983 48.2629356,49.0678514 47.998723,47.4108044 C47.4702978,44.0552843 47.2281029,40.6790512 47.294156,37.302818 C47.3822269,30.6124909 48.5051304,23.7978853 50.8390084,17.4596807 C52.1380537,13.9177428 53.8554356,10.4793704 55.8590478,7.22741574 C55.9691364,7.02028487 56.2773844,7.20670266 56.1893136,7.41383353 L56.1893136,7.41383353 Z"
                    fill="#00206A"
                  />
                  <path
                    id="Path"
                    d="M52.6002137,6.52081039 C51.7611676,7.93469638 51.0479784,9.43175214 50.313813,10.9080154 C49.6006238,12.3634863 48.9713392,13.902127 48.3630307,15.3991827 C47.1464138,18.4556715 46.1605346,21.6161226 45.5102739,24.8389509 C44.1048716,31.7004565 44.2097524,38.8114713 45.1536793,45.7145617 C45.4263693,47.6898436 45.7619877,49.685918 46.1395585,51.6404074 C46.5171293,53.5948969 46.9995808,55.5493864 47.2303185,57.5454607 C47.2512946,57.7741775 47.0415331,57.9613095 46.8317716,57.982102 C46.6010339,58.0236868 46.4332246,57.8781397 46.3283439,57.6702153 C45.6361308,55.9860276 45.1956316,54.1978777 44.7970847,52.4305202 C44.3985378,50.7047476 44.0629193,48.9581825 43.7902293,47.2116175 C43.2238732,43.6561101 42.8463024,40.0382253 42.8253263,36.441133 C42.7623978,29.4964577 43.8741339,22.5101975 46.4961531,16.0645408 C46.8527477,15.1912583 47.2512946,14.3179758 47.6498415,13.4654857 C48.0483884,12.6337881 48.53084,11.8436753 48.9923153,11.0327701 C49.4537907,10.2218649 49.9152661,9.36937481 50.5025984,8.64163938 C50.7962645,8.26737544 51.0479784,7.87231906 51.3206683,7.47726268 C51.6143345,7.0822063 51.9289768,6.70794236 52.2226429,6.31288598 C52.4114283,6.14654645 52.7470468,6.31288598 52.6002137,6.52081039 L52.6002137,6.52081039 Z"
                    fill="#00206A"
                  />
                  <path
                    id="Path"
                    d="M47.2372953,6.7673914 C45.4465394,9.7308548 43.6776221,12.6525793 42.3454744,15.8247373 C41.0133268,18.9968953 40.0087565,22.2942701 39.3099249,25.6333838 C37.9559388,32.2698722 37.8467464,39.0733164 39.0915401,45.7306743 C39.4409558,47.6089257 39.8777255,49.4454383 40.4236877,51.2819508 C40.707588,52.2002071 40.9914883,53.0975939 41.2972271,53.9949807 C41.6248044,54.9132369 41.9742202,55.8314932 42.0834126,56.8123578 C42.1052511,57.0627914 41.7339968,57.1880081 41.559289,57.0210524 C40.9478114,56.3532297 40.5547186,55.5810597 40.2053028,54.7671507 C39.8558871,53.9532417 39.5064713,53.1393328 39.222571,52.3045544 C38.6329318,50.655867 38.1306467,48.9654407 37.7593924,47.2541449 C36.9950454,43.8524228 36.6019527,40.3463535 36.5801142,36.8611535 C36.5145987,29.9116232 37.8467464,22.9412233 40.663911,16.5342989 C41.4500965,14.7395253 42.3454744,12.9864907 43.3282063,11.2751949 C44.3109382,9.54302966 45.4028625,7.87347281 46.7350101,6.35000219 C46.953395,6.05782974 47.4338417,6.43348003 47.2372953,6.7673914 L47.2372953,6.7673914 Z"
                    fill="#00206A"
                  />
                  <path
                    id="Path"
                    d="M41.0138535,7.35741141 C40.0894634,8.80045163 39.3411476,10.34806 38.6588596,11.8956683 C37.998581,13.4223631 37.3162931,14.9490578 36.7660609,16.5175798 C35.6435872,19.6755373 34.8072342,22.9589767 34.3010206,26.2842433 C33.3106026,32.8092947 33.6847605,39.5434824 35.3574664,45.9430521 C35.8416708,47.7625376 36.4139123,49.5611094 37.0741909,51.317854 C37.4043302,52.1543991 37.7344695,52.9909442 38.1086274,53.8065756 C38.5047946,54.6849479 39.0110082,55.5842338 39.1870826,56.525347 C39.2531104,56.9436195 38.7689061,57.2991512 38.3947482,56.9645332 C37.7124602,56.358038 37.3162931,55.5214929 36.8981166,54.7476888 C36.5019494,53.9738846 36.1498008,53.1582532 35.7976522,52.3635354 C35.1153643,50.815927 34.5431228,49.2055778 34.0589184,47.5952286 C33.0685005,44.2908756 32.4522404,40.8610409 32.2321475,37.4521198 C31.7699525,30.6761048 32.6943426,23.7746081 35.1153643,17.3750384 C35.7976522,15.5764666 36.5899866,13.7778947 37.5143767,12.083891 C38.4387668,10.3898872 39.5832497,8.80045163 40.7057234,7.21101602 C40.8377792,7.04370701 41.1238999,7.19010239 41.0138535,7.35741141 L41.0138535,7.35741141 Z"
                    fill="#00206A"
                  />
                  <path
                    id="Path"
                    d="M33.0831281,13.6252174 C32.5251875,14.8583989 32.1665114,16.1333833 31.8078353,17.4501704 C31.4690856,18.7251548 31.0904831,20.0001392 30.8314392,21.3169263 C30.3133515,23.9086978 29.9945283,26.5213707 29.934749,29.1758463 C29.7753374,34.777417 30.6122483,40.3162835 31.8277617,45.7506431 C32.1864378,47.3391482 32.5650404,48.9067519 32.9635694,50.4743556 C33.3421719,52.0001566 33.8004803,53.5677603 33.9001125,55.1562654 C33.920039,55.3234765 33.700848,55.3652793 33.6211422,55.239871 C32.8838636,54.0275907 32.4255552,52.6062967 31.9672469,51.2686082 C31.5089385,49.8891169 31.1104095,48.4887242 30.7517334,47.0674302 C30.0144548,44.2457435 29.4365877,41.382254 29.0579852,38.4978632 C28.6793826,35.6970778 28.5000446,32.8544897 28.5598239,30.0119016 C28.6395297,27.2947218 28.8786471,24.5148379 29.5162935,21.8812636 C29.8749696,20.3972655 30.2934251,18.9341686 30.8115128,17.5128746 C31.3296005,16.1124819 32.106732,14.7956948 32.8041578,13.4789077 C32.90379,13.2698938 33.1628339,13.4371049 33.0831281,13.6252174 L33.0831281,13.6252174 Z"
                    fill="#00206A"
                  />
                  <path
                    id="Path"
                    d="M27.02432,18.2495052 C26.5990918,19.1922171 26.1738636,20.0720816 25.939988,21.0985901 C25.7061125,22.1041494 25.5998054,23.1516071 25.5572826,24.1781156 C25.4509756,26.3987259 25.5147598,28.6193361 25.6423283,30.8189972 C25.8762038,35.3021161 26.7053989,39.7223874 27.9598222,44.0169639 C28.3212662,45.2320148 28.7039716,46.4470656 29.1504613,47.6621165 C29.5756895,48.8562183 30.064702,50.0293709 30.3198389,51.2653709 C30.426146,51.7262523 29.8520878,51.9147947 29.5969509,51.5586591 C28.8740629,50.6159472 28.3850504,49.5475403 27.9172994,48.4581844 C27.4708097,47.3897775 27.0668429,46.2794724 26.6841375,45.1691673 C25.939988,42.9695062 25.3871913,40.7279468 24.9619631,38.4654382 C24.0902452,33.8566245 23.8563697,29.1640141 24.3241207,24.5133021 C24.4516892,23.3192003 24.6005191,22.1460478 24.9619631,20.9938443 C25.2808843,19.9044883 25.7486353,18.7103866 26.5990918,17.9143188 C26.8329673,17.7048272 27.1306271,17.9981154 27.02432,18.2495052 L27.02432,18.2495052 Z"
                    fill="#00206A"
                  />
                  <path
                    id="Path"
                    d="M39.2542373,30.3328197 C42.877906,33.3586786 47.2677219,36.8351973 51.7196577,38.4017767 C53.7489122,39.1099565 59.0912353,41.2130357 60.9341296,39.4747763 C62.7977307,37.715057 60.0230358,35.7836577 58.6356883,35.054018 C52.6721649,31.9423191 45.8803744,31.1053794 39.2542373,30.3328197 Z"
                    fill="url(#linearGradient-136)"
                  />
                  <path
                    id="Path"
                    d="M66.9259974,10.0130678 C57.9789704,11.6279573 49.8281659,13.2221431 41.8868936,17.2593669 C37.821968,19.474664 34.3646858,22.2903688 30.4883392,25.1060736 C30.1321344,25.3545181 29.7968828,25.6029627 29.440678,25.8721109 C30.9283569,23.5947027 32.7722407,21.5243315 34.9723294,19.6817012 C40.2734953,15.2511069 46.3708837,12.8494763 52.6778045,10.6341792 C56.9103559,9.1021045 61.8762702,8.3774746 65.6897572,6.2449923 C66.8631378,6.7832888 68.0155651,7.36299272 69.1470393,8.0255115 C69.2937119,8.14973377 69.4403844,8.27395604 69.587057,8.39817831 C69.4403844,8.54310429 69.3146651,8.68803027 69.1679925,8.85365996 C68.7698812,9.41266018 67.7431732,10.0130678 66.9259974,10.0130678 Z"
                    fill="url(#linearGradient-137)"
                  />
                  <path
                    id="Path"
                    d="M17.2545295,28.82054 C17.6304862,26.5709455 18.3823996,24.5483744 19.3849507,22.6289956 C19.9279993,22.7115495 20.4083884,22.5464417 20.7634586,22.0304796 C23.1654041,19.3887541 25.0451876,16.210428 27.7186574,13.8370026 C30.1206029,11.4635773 32.5434349,9.33781373 35.4675425,7.23268865 C44.7829139,1.22689063 55.7900904,1.59838329 65.1263482,5.78799497 C61.3250083,7.93439701 56.3749119,8.65674385 52.1558424,10.163353 C45.869011,12.3716705 39.770158,14.7657343 34.5067643,19.1823692 C29.0345058,23.7847505 25.7762145,29.811187 24.5647985,36.8282706 C24.3768201,38.2316874 24.3141607,39.6351041 24.3559337,41.0385208 C23.4995879,40.3780894 22.6641285,39.6970195 21.8495557,38.9333957 C21.5362585,38.7063724 21.2020747,38.5412646 20.8887775,38.4587107 C20.2204101,38.2523258 19.5729291,38.3142413 18.9254481,38.5206261 C18.6121509,38.5825415 18.2988536,38.6857339 17.9646699,38.7889264 C16.9412322,35.5693233 16.669708,32.1433354 17.2545295,28.82054 Z"
                    fill="url(#linearGradient-138)"
                  />
                  <circle
                    id="Oval"
                    cx="78.5084746"
                    cy="34.7935285"
                    fill="#000000"
                    r="3.56856703"
                  />
                  <circle
                    id="Oval"
                    cx="77.1702619"
                    cy="32.5631741"
                    fill="#FFFFFF"
                    r="1.33821263"
                  />
                </g>
              </g>
              <g id="PlayButton" className="animate-pulse">
                <path
                  d="M274.779661,205.057602 L274.779661,269.5362 C274.779661,270.64077 275.675092,271.5362 276.779661,271.5362 C277.129899,271.5362 277.473996,271.444227 277.777526,271.269482 L334.196299,238.788726 C335.153564,238.23762 335.482821,237.014844 334.931716,236.057579 C334.753536,235.748082 334.495735,235.491939 334.185094,235.31576 L277.766321,203.317918 C276.80552,202.773 275.584894,203.110141 275.039977,204.070942 C274.869352,204.371788 274.779661,204.71174 274.779661,205.057602 Z"
                  fill="black"
                  fillOpacity="1"
                />
                <path
                  d="M274.779661,205.057602 L274.779661,269.5362 C274.779661,270.64077 275.675092,271.5362 276.779661,271.5362 C277.129899,271.5362 277.473996,271.444227 277.777526,271.269482 L334.196299,238.788726 C335.153564,238.23762 335.482821,237.014844 334.931716,236.057579 C334.753536,235.748082 334.495735,235.491939 334.185094,235.31576 L277.766321,203.317918 C276.80552,202.773 275.584894,203.110141 275.039977,204.070942 C274.869352,204.371788 274.779661,204.71174 274.779661,205.057602 Z"
                  fill="#FFFFFF"
                  fillRule="evenodd"
                />
              </g>
              <g
                id="Group"
                fillRule="nonzero"
                transform="translate(488.001541, 247.123267)"
              >
                <g className="Fish2">
                  <path
                    id="Path"
                    d="M48.098889,28.9324342 C46.9136511,32.4704077 44.2891957,35.0969033 41.3744781,37.3036393 C40.225523,37.735392 39.0402851,38.0831927 37.8550472,38.4070073 C34.1058252,39.4024371 30.0421524,40.4698257 26.1477993,40.0980387 C27.0427749,40.8536059 27.9377505,41.6211662 28.832726,42.3767334 C18.5042243,40.685702 8.00640294,38.0592065 0.471676306,30.3356305 C0.302356607,30.1557335 0.133036907,29.9758366 0,29.7599602 C3.07194312,31.1871427 6.38577153,32.038655 9.78425979,32.4704077 C13.1585595,32.8901673 16.6296134,32.9021604 20.0401959,32.6263184 C22.652557,32.410442 25.216541,32.038655 27.6958652,31.5709229 C33.1745669,30.5035343 38.2299693,27.901025 41.8219658,23.307656 C42.3299249,22.8039446 42.9104496,22.6840133 43.5030686,22.7799583 C43.249089,22.7679652 43.0072037,22.7799583 42.7653184,22.8159377 C43.4667858,23.5715049 44.5068925,24.5069691 45.6558476,25.3344951 C45.9219214,25.7782409 46.224278,26.2099936 46.6959543,26.5098219 C46.7806142,26.5338081 46.8531798,26.6537394 46.9015568,26.6897188 C47.7118725,27.1934303 48.4133399,27.9729838 48.098889,28.9324342 Z"
                    fill="url(#linearGradient-141)"
                  />
                  <path
                    id="Path"
                    d="M46.3944092,16.6640283 C47.8524142,15.9019797 49.3582226,15.6479635 50.8520801,15.6842515 C50.8281784,15.2125072 50.7684241,14.7286668 50.6847681,14.2448264 C50.3023406,12.1764088 49.8004044,9.91445509 48.043628,8.64437412 C47.8643651,8.51131802 47.6612004,8.487126 47.4460849,8.52341403 C46.6095247,9.30965463 45.820768,10.1321833 44.8527483,10.8216558 C44.1356967,11.3296882 43.251333,11.7288565 42.4506254,12.1764088 C41.8650332,12.8658814 41.0643256,13.4222978 40.4906843,12.8054013 C38.8295147,11.4627443 37.431264,9.76930298 35.6505859,8.60808609 C34.013318,7.42267718 32.4119027,6.4066124 30.4997651,5.43893166 C23.7355782,2.43912136 16.5292094,4.45915491 11.3066835,8.8741983 C10.9481577,9.28546261 10.6254845,9.69672693 10.326713,10.1079912 C8.36677189,12.8537853 7.42265393,16.1438999 6.19171532,19.2525743 C5.67782833,20.5347512 5.24759736,21.9136963 4.47079144,23.0386252 C3.3713123,24.6232024 1.91330735,26.0505315 0.658467018,27.5141486 C0.323842931,27.9012209 -0.0227320169,28.3487732 0.00116970358,28.8689016 C0.0131205638,29.0987258 0.0967765857,29.304358 0.216285188,29.4857981 C8.56993651,33.4411931 18.7281677,33.0420248 27.5837552,31.3001995 C32.9974949,30.2236547 37.9929545,27.5988207 41.54236,22.9660491 C41.709672,22.796705 41.8769841,22.6757449 42.056247,22.5910728 C43.1796278,20.3412151 43.9803355,17.9099172 46.3944092,16.6640283 Z"
                    fill="url(#linearGradient-142)"
                  />
                  <path
                    id="Path"
                    d="M46.3287969,16.5390984 C43.8827112,17.7133741 43.0874321,20.0049219 41.9306626,22.1368595 C42.3042027,21.9658484 42.6897926,21.9316462 43.0874321,21.9886499 C44.6659406,22.0684551 46.3287969,22.9805139 47.847057,23.6417565 C48.3169946,23.4707455 48.7146342,23.1971279 48.9194788,22.8209036 C50.1726458,20.5407565 50.9799746,18.0895984 50.8353784,15.6156388 C49.3171183,15.5814366 47.8109079,15.820852 46.3287969,16.5390984 Z"
                    fill="url(#linearGradient-143)"
                  />
                  <path
                    id="Path"
                    d="M30.8172363,5.29678046 C32.7319953,6.26525594 34.3475732,7.29426114 35.9751184,8.46853767 C37.7702049,9.6186023 39.1703724,11.3255403 40.8218521,12.6693001 C41.3962798,13.2867032 42.1980851,12.7298298 42.7844801,12.039791 C42.4134955,12.2455921 42.0664454,12.475605 41.7672643,12.7298298 C42.0903799,12.4513931 42.6049714,12.0034732 43.2033336,11.4708117 C43.2392353,11.410282 43.2871043,11.3376463 43.3110388,11.2771166 C43.2751371,11.3376463 43.2392353,11.398176 43.2033336,11.4708117 C44.2684183,10.4902302 45.5728479,9.15857645 46.3866204,7.86324049 C46.4584239,6.65264613 45.7044875,5.36941612 44.9266167,4.46147035 C43.2272681,2.51241344 40.9534918,1.79816277 38.6677482,0.648098131 C38.0454515,0.551250582 37.4111876,0.490720865 36.7888909,0.466508977 C31.2480571,0.212284163 25.5157473,2.391354 19.7475358,3.57773647 C16.7317904,4.19513959 13.7040777,6.32578566 11.5978428,8.73486842 C16.8275284,4.32830497 24.0437763,2.3066124 30.8172363,5.29678046 Z"
                    fill="url(#linearGradient-144)"
                  />
                  <path
                    id="Path"
                    d="M44.2793921,5.11035563 C45.0148113,5.99650986 45.7276023,7.26586592 45.6597174,8.47534669 C46.4630216,7.12216523 46.7571893,5.80490895 45.7502306,4.91875472 C43.3516324,2.81114466 40.8851493,1.74536458 38.3620955,1.33821263 C40.5230967,2.47584306 42.6727838,3.17039638 44.2793921,5.11035563 Z"
                    fill="url(#linearGradient-145)"
                  />
                  <path
                    id="Path"
                    d="M52.2211188,10.6045553 C51.3072175,8.98606883 49.5301872,6.55833915 47.7023845,8.04781581 C47.5627607,8.16509744 47.4231369,8.28237907 47.2835131,8.39966069 C47.5119884,8.36447621 47.7404638,8.39966069 47.9181668,8.51694232 C49.7840486,9.7483994 50.3171577,11.9415658 50.7233361,13.9470816 C50.8248807,14.4162081 50.875653,14.8736065 50.9010391,15.342733 C51.7768612,15.3544612 52.6526833,15.4600146 53.5285054,15.6124807 C53.4904262,13.8532563 53.0715547,12.1292164 52.2211188,10.6045553 Z"
                    fill="url(#linearGradient-146)"
                  />
                  <path
                    id="Path"
                    d="M51.0840628,15.6124807 C51.2247922,18.1628001 50.439053,20.6663247 49.219398,23.0060673 C49.0200314,23.3921248 48.6447529,23.6845926 48.1756549,23.8483746 C48.5392059,24.0121566 48.8910294,24.1642398 49.2311255,24.2929257 C49.711951,24.4567077 50.2279589,24.6321883 50.7087844,24.4684064 C51.2130648,24.2929257 51.5179785,23.8015797 51.7759825,23.3336312 C52.9370002,21.1342732 53.5937375,18.4669667 53.5233727,15.8815511 C52.7024511,15.7294679 51.893257,15.6241795 51.0840628,15.6124807 Z"
                    fill="url(#linearGradient-147)"
                  />
                  <path
                    id="Path"
                    d="M46.1467758,26.5742265 C46.2398647,26.5974222 46.2980453,26.7134006 46.3445898,26.7481941 C47.1358457,27.2469014 47.8107404,28.0007612 47.5082014,28.9285886 C46.367862,32.3499522 43.8428248,34.8898798 41.0385208,37.0238829 C42.7490299,36.3744037 44.36645,35.539359 45.7744201,34.3331834 C47.6594709,32.7210832 49.1023493,30.5406888 49.8819691,28.1863267 C49.9517858,27.9775655 50.0099664,27.7340108 49.8936052,27.5484453 C49.7539718,27.3164884 49.4281606,27.2932928 49.1488938,27.2584992 C47.9271016,27.1541186 46.4725871,26.3654653 45.1577059,25.4260401 C45.4020644,25.8551602 45.6929673,26.2726826 46.1467758,26.5742265 Z"
                    fill="url(#linearGradient-148)"
                  />
                  <path
                    id="Path"
                    d="M20.2330506,32.3726993 C16.7867123,32.6540859 13.2792686,32.6418517 9.86959347,32.2136547 C9.46629855,31.8099262 9.11188787,31.430666 8.80636142,31.0758742 C7.98755054,30.1216067 7.21762389,29.0205287 7.14429754,27.7726404 C7.04652907,26.2678339 7.96310842,24.8853693 9.06300364,23.8576966 C10.1262357,22.8667264 11.4461099,22.0837377 12.8881948,21.9002247 C14.6846903,21.6677749 16.5300701,22.4018269 17.8377233,23.6497152 C19.1453765,24.8976035 19.9519663,26.6103914 20.318598,28.3843504 C20.5874613,29.6934097 20.6119034,31.1003426 20.2330506,32.3726993 Z"
                    fill="url(#linearGradient-149)"
                  />
                  <path
                    id="Path"
                    d="M20.5192604,31.828387 C20.3803893,32.252034 20.2036442,32.6635769 19.9637759,33.0509114 C17.2621013,37.4084241 12.6162311,34.3581652 9.81355932,31.6710324 C13.335836,32.0946794 16.9591098,32.1067836 20.5192604,31.828387 Z"
                    fill="url(#linearGradient-150)"
                  />
                  <path
                    id="Path"
                    d="M16.9692352,9.56266324 C17.8576935,11.1820032 18.657306,12.8496817 19.4442263,14.5173602 C20.2438388,16.1850387 20.9926822,17.8648019 21.6399876,19.5929035 C22.9092138,22.9403451 23.7595953,26.4328023 23.9245947,29.9977672 C23.9753638,30.9766219 23.9626715,31.9554767 23.9119025,32.9222469 C23.8865179,33.4056319 23.8357489,33.889017 23.7976721,34.3724021 C23.7849798,34.6140946 23.7595953,34.8678718 23.7469031,35.1095643 C23.7215185,35.3754261 23.7469031,35.6292033 23.7342108,35.8950651 C23.7215185,36.1367576 24.0895941,36.2334346 24.17844,35.9917421 C24.2545935,35.7863034 24.3688239,35.5929494 24.4322852,35.3754261 C24.4957465,35.1579028 24.5592078,34.9403795 24.6099769,34.7107716 C24.711515,34.2636404 24.7749763,33.8044246 24.8384376,33.3572934 C24.9399757,32.4751157 24.9907447,31.5929379 24.9780525,30.6986755 C24.9526679,28.8859815 24.7368995,27.0732875 24.3688239,25.2968473 C23.6072882,21.6835439 22.2492161,18.1790022 20.497684,14.8919837 C20.0026858,13.973552 19.4949953,13.0551204 18.9619203,12.160858 C18.4034608,11.2424264 17.8069245,10.348164 17.2357727,9.42973234 C17.1342346,9.29680145 16.8803893,9.39347846 16.9692352,9.56266324 L16.9692352,9.56266324 Z"
                    fill="url(#linearGradient-151)"
                  />
                  <path
                    id="Path"
                    d="M18.7523845,7.76478188 C19.7854634,9.39899757 20.7163696,11.092424 21.5337507,12.8450611 C22.3624844,14.5976982 23.1117504,16.3858617 23.7247862,18.2213939 C24.9395054,21.8687738 25.6320088,25.6937859 25.8590591,29.5424823 C25.9271742,30.6082751 25.9385267,31.6740679 25.9385267,32.7398608 C25.9385267,33.2964415 25.9385267,33.8530222 25.9385267,34.4096029 C25.9385267,34.67013 25.9385267,34.9424993 25.9498793,35.2030265 C25.9612318,35.4872379 25.9498793,35.7596072 25.9839368,36.0438186 C25.9952893,36.1503979 26.142872,36.16224 26.1769296,36.0675029 C26.3358648,35.6056593 26.4039799,35.1082893 26.5061525,34.6227615 C26.6083252,34.1609179 26.6423827,33.6635479 26.6764403,33.1898622 C26.7559079,32.2069644 26.7786129,31.2240665 26.7559079,30.2411687 C26.7218503,28.2516887 26.5288576,26.2740509 26.1882821,24.3082552 C25.5184837,20.4358745 24.3037645,16.575336 22.4987146,13.1055882 C21.4883407,11.1634768 20.2736215,9.32794471 18.9226722,7.62267616 C18.8318521,7.51609688 18.6842694,7.64636045 18.7523845,7.76478188 L18.7523845,7.76478188 Z"
                    fill="url(#linearGradient-152)"
                  />
                  <path
                    id="Path"
                    d="M20.5473511,6.86617079 C21.1588592,7.60134231 21.7115684,8.40765946 22.2642777,9.19026141 C22.8169869,9.97286335 23.3226571,10.7910381 23.8048077,11.6092129 C24.7926284,13.2692776 25.6510917,15.000488 26.3331585,16.802844 C27.7913701,20.6328504 28.4146379,24.7711547 28.5439954,28.8620285 C28.5792747,30.0359314 28.5792747,31.2098343 28.5439954,32.3955948 C28.5087161,33.5694977 28.4381575,34.7434006 28.4851966,35.9173036 C28.4851966,36.0477372 28.6380736,36.1425981 28.7439115,36.1307405 C28.8850288,36.1307405 28.9673472,36.024022 28.9908667,35.8935884 C29.2260621,34.8501191 29.3083805,33.7829346 29.3671794,32.7157502 C29.4259783,31.6722809 29.4494978,30.6406692 29.437738,29.5972 C29.4142185,27.4865463 29.284861,25.3640349 28.9555874,23.2652388 C28.3205598,19.233653 27.0269849,15.3087857 24.9102262,11.8226498 C24.6162319,11.3483456 24.3222376,10.885899 24.0047238,10.4234524 C23.6989697,9.97286335 23.3461766,9.55784717 23.0051432,9.14283099 C22.6641099,8.7159572 22.3230765,8.2653682 21.9114845,7.89778244 C21.7115684,7.71991836 21.5234121,7.50648147 21.3352557,7.30490218 C21.1353396,7.10332289 20.911904,6.91360121 20.7119879,6.72387952 C20.6179097,6.62901868 20.4532729,6.75945234 20.5473511,6.86617079 L20.5473511,6.86617079 Z"
                    fill="url(#linearGradient-153)"
                  />
                  <path
                    id="Path"
                    d="M24.1256528,6.12094034 C25.3576222,7.64564075 26.5895915,9.15861269 27.5912862,10.8475116 C28.592981,12.5364105 29.4449972,14.3308656 30.1243074,16.1722346 C31.471414,19.8315155 32.162238,23.7136373 32.1161831,27.6192161 C32.1046693,28.7216918 32.0355869,29.812439 31.9204496,30.9031862 C31.8628809,31.4426956 31.7937986,31.9939334 31.7016887,32.5334428 C31.6210926,33.0964091 31.5059552,33.6476469 31.5520102,34.2106132 C31.5635239,34.3513548 31.7707711,34.3982686 31.8513672,34.280984 C32.1161831,33.8470308 32.2543478,33.3661638 32.3694852,32.8735682 C32.4846225,32.3809727 32.5882461,31.8883772 32.6688422,31.3840532 C32.8300345,30.3871337 32.9336581,29.3784858 32.979713,28.3698378 C33.0718228,26.3525419 32.9451718,24.3235175 32.6458147,22.341407 C32.0355869,18.3654575 30.6654528,14.518521 28.5699535,11.1055378 C27.9827531,10.1438037 27.3379841,9.22898348 26.6586739,8.33762017 C25.96785,7.43452839 25.2309711,6.57835047 24.3789549,5.83945719 C24.2177627,5.69871562 23.9990018,5.95674184 24.1256528,6.12094034 L24.1256528,6.12094034 Z"
                    fill="url(#linearGradient-154)"
                  />
                  <path
                    id="Path"
                    d="M27.6774469,5.94713718 C28.3321588,6.69319715 28.9020007,7.51031044 29.4354697,8.35110818 C29.9568144,9.16822148 30.4902834,9.98533478 30.9510066,10.8379747 C31.8967016,12.5550969 32.6726565,14.3669568 33.2788713,16.2261856 C34.4670522,19.8854321 34.9277754,23.7933653 34.6125438,27.6184029 C34.5276737,28.7078873 34.3821822,29.7855295 34.1760691,30.8631716 C34.0790748,31.3723872 33.9699561,31.8816027 33.8365889,32.3908182 C33.7032216,32.9355604 33.4971086,33.5039871 33.5092329,34.0605715 C33.5092329,34.3092581 33.8244646,34.463207 33.9942047,34.2382048 C34.3094364,33.8237271 34.4549279,33.3145115 34.6125438,32.8171382 C34.7580353,32.3316071 34.8792783,31.8342338 35.0005212,31.3487027 C35.2308828,30.3894828 35.3884987,29.4184206 35.5097416,28.4473584 C35.7401032,26.4578652 35.7401032,24.4328452 35.5339902,22.443352 C35.1217642,18.4998922 33.9335832,14.6156435 31.9451988,11.1577147 C31.3874812,10.1866525 30.7691422,9.22743259 30.0780573,8.33926596 C29.3869725,7.45109934 28.5988933,6.64582826 27.8108141,5.82871496 C27.7380683,5.74581941 27.6047011,5.85239941 27.6774469,5.94713718 L27.6774469,5.94713718 Z"
                    fill="url(#linearGradient-155)"
                  />
                  <path
                    id="Path"
                    d="M32.1385179,8.63943024 C32.6361511,9.28756858 33.0159239,9.98284426 33.3956966,10.7016886 C33.7623737,11.3969643 34.1421464,12.09224 34.4564411,12.8110843 C35.0719348,14.2369887 35.5564724,15.7100304 35.8838627,17.2184251 C36.5779301,20.4119795 36.617217,23.6644555 36.381496,26.9051473 C36.3160179,27.8478939 36.2243486,28.7906406 36.1195837,29.721603 C36.0279144,30.6289967 35.8838627,31.5835277 35.9886276,32.4909214 C36.0017232,32.585196 36.1457749,32.585196 36.1850618,32.5027057 C36.5517389,31.736724 36.7088862,30.8764677 36.8660336,30.0633487 C37.0231809,29.226661 37.1410414,28.378189 37.2327107,27.5297169 C37.4160492,25.8445572 37.5077185,24.1476132 37.4553361,22.4506692 C37.4029536,20.8008625 37.2327107,19.1628401 36.8791292,17.5483864 C36.5386433,16.0046387 36.0802969,14.425538 35.3862295,12.9878493 C34.9933612,12.1747303 34.561206,11.38518 34.0504771,10.6191983 C33.5528439,9.86500093 32.8980634,9.19329391 32.2956652,8.50980257 C32.2170916,8.4155279 32.0599442,8.53337123 32.1385179,8.63943024 L32.1385179,8.63943024 Z"
                    fill="url(#linearGradient-156)"
                  />
                  <path
                    id="Path"
                    d="M36.60396,11.4228901 C36.8878471,11.9165805 37.1615954,12.3867617 37.3542331,12.9392247 C37.5468708,13.4916877 37.6786756,14.0794143 37.7902027,14.6553864 C38.0233957,15.9013667 38.1653393,17.1826107 38.297144,18.4521001 C38.5506147,21.0263426 38.5100594,23.6240941 38.2565887,26.1865821 C38.1856169,26.915363 38.0943675,27.644144 37.9828404,28.372925 C37.8713133,29.0899514 37.7395085,29.8069779 37.7090921,30.5357588 C37.6989532,30.8061131 37.9828404,30.8648857 38.0842286,30.6415496 C38.357977,30.030314 38.5100594,29.3838147 38.6418641,28.7138064 C38.7736688,28.0555526 38.8750571,27.3972988 38.9663066,26.7272905 C39.1386666,25.410783 39.229916,24.0825209 39.2501937,22.7425042 C39.290749,20.0389619 39.0271395,17.3471741 38.4188099,14.7259136 C38.2667275,14.0559052 38.0842286,13.3976515 37.8206191,12.7746613 C37.5772873,12.1869347 37.2528449,11.55219 36.77632,11.1760449 C36.6445153,11.0820087 36.5228494,11.2818357 36.60396,11.4228901 L36.60396,11.4228901 Z"
                    fill="url(#linearGradient-157)"
                  />
                  <path
                    id="Path"
                    d="M30.3328197,20.0731895 C28.4695536,22.0438853 26.194917,24.3221463 23.702496,25.5751899 C22.5651777,26.1447551 19.6008906,27.7737118 18.342581,27.0104943 C17.0721723,26.2358856 18.5361671,24.9372768 19.2863132,24.4132768 C22.5167812,22.180581 26.4610978,21.1097983 30.3328197,20.0731895 Z"
                    fill="url(#linearGradient-158)"
                  />
                  <circle
                    id="Oval"
                    cx="8.47534669"
                    cy="24.9799692"
                    fill="#000000"
                    r="2.23035439"
                  />
                  <circle
                    id="Oval"
                    cx="8.92141757"
                    cy="24.5338983"
                    fill="#FFFFFF"
                    r="1"
                  />
                </g>
              </g>
              <g
                id="Group"
                fillRule="nonzero"
                transform="translate(448.747304, 333.661017)"
              >
                <g className="Fish2">
                  <path
                    id="Path"
                    d="M48.098889,28.9324342 C46.9136511,32.4704077 44.2891957,35.0969033 41.3744781,37.3036393 C40.225523,37.735392 39.0402851,38.0831927 37.8550472,38.4070073 C34.1058252,39.4024371 30.0421524,40.4698257 26.1477993,40.0980387 C27.0427749,40.8536059 27.9377505,41.6211662 28.832726,42.3767334 C18.5042243,40.685702 8.00640294,38.0592065 0.471676306,30.3356305 C0.302356607,30.1557335 0.133036907,29.9758366 0,29.7599602 C3.07194312,31.1871427 6.38577153,32.038655 9.78425979,32.4704077 C13.1585595,32.8901673 16.6296134,32.9021604 20.0401959,32.6263184 C22.652557,32.410442 25.216541,32.038655 27.6958652,31.5709229 C33.1745669,30.5035343 38.2299693,27.901025 41.8219658,23.307656 C42.3299249,22.8039446 42.9104496,22.6840133 43.5030686,22.7799583 C43.249089,22.7679652 43.0072037,22.7799583 42.7653184,22.8159377 C43.4667858,23.5715049 44.5068925,24.5069691 45.6558476,25.3344951 C45.9219214,25.7782409 46.224278,26.2099936 46.6959543,26.5098219 C46.7806142,26.5338081 46.8531798,26.6537394 46.9015568,26.6897188 C47.7118725,27.1934303 48.4133399,27.9729838 48.098889,28.9324342 Z"
                    fill="url(#linearGradient-141)"
                  />
                  <path
                    id="Path"
                    d="M46.3944092,16.6640283 C47.8524142,15.9019797 49.3582226,15.6479635 50.8520801,15.6842515 C50.8281784,15.2125072 50.7684241,14.7286668 50.6847681,14.2448264 C50.3023406,12.1764088 49.8004044,9.91445509 48.043628,8.64437412 C47.8643651,8.51131802 47.6612004,8.487126 47.4460849,8.52341403 C46.6095247,9.30965463 45.820768,10.1321833 44.8527483,10.8216558 C44.1356967,11.3296882 43.251333,11.7288565 42.4506254,12.1764088 C41.8650332,12.8658814 41.0643256,13.4222978 40.4906843,12.8054013 C38.8295147,11.4627443 37.431264,9.76930298 35.6505859,8.60808609 C34.013318,7.42267718 32.4119027,6.4066124 30.4997651,5.43893166 C23.7355782,2.43912136 16.5292094,4.45915491 11.3066835,8.8741983 C10.9481577,9.28546261 10.6254845,9.69672693 10.326713,10.1079912 C8.36677189,12.8537853 7.42265393,16.1438999 6.19171532,19.2525743 C5.67782833,20.5347512 5.24759736,21.9136963 4.47079144,23.0386252 C3.3713123,24.6232024 1.91330735,26.0505315 0.658467018,27.5141486 C0.323842931,27.9012209 -0.0227320169,28.3487732 0.00116970358,28.8689016 C0.0131205638,29.0987258 0.0967765857,29.304358 0.216285188,29.4857981 C8.56993651,33.4411931 18.7281677,33.0420248 27.5837552,31.3001995 C32.9974949,30.2236547 37.9929545,27.5988207 41.54236,22.9660491 C41.709672,22.796705 41.8769841,22.6757449 42.056247,22.5910728 C43.1796278,20.3412151 43.9803355,17.9099172 46.3944092,16.6640283 Z"
                    fill="url(#linearGradient-142)"
                  />
                  <path
                    id="Path"
                    d="M46.3287969,16.5390984 C43.8827112,17.7133741 43.0874321,20.0049219 41.9306626,22.1368595 C42.3042027,21.9658484 42.6897926,21.9316462 43.0874321,21.9886499 C44.6659406,22.0684551 46.3287969,22.9805139 47.847057,23.6417565 C48.3169946,23.4707455 48.7146342,23.1971279 48.9194788,22.8209036 C50.1726458,20.5407565 50.9799746,18.0895984 50.8353784,15.6156388 C49.3171183,15.5814366 47.8109079,15.820852 46.3287969,16.5390984 Z"
                    fill="url(#linearGradient-143)"
                  />
                  <path
                    id="Path"
                    d="M30.8172363,5.29678046 C32.7319953,6.26525594 34.3475732,7.29426114 35.9751184,8.46853767 C37.7702049,9.6186023 39.1703724,11.3255403 40.8218521,12.6693001 C41.3962798,13.2867032 42.1980851,12.7298298 42.7844801,12.039791 C42.4134955,12.2455921 42.0664454,12.475605 41.7672643,12.7298298 C42.0903799,12.4513931 42.6049714,12.0034732 43.2033336,11.4708117 C43.2392353,11.410282 43.2871043,11.3376463 43.3110388,11.2771166 C43.2751371,11.3376463 43.2392353,11.398176 43.2033336,11.4708117 C44.2684183,10.4902302 45.5728479,9.15857645 46.3866204,7.86324049 C46.4584239,6.65264613 45.7044875,5.36941612 44.9266167,4.46147035 C43.2272681,2.51241344 40.9534918,1.79816277 38.6677482,0.648098131 C38.0454515,0.551250582 37.4111876,0.490720865 36.7888909,0.466508977 C31.2480571,0.212284163 25.5157473,2.391354 19.7475358,3.57773647 C16.7317904,4.19513959 13.7040777,6.32578566 11.5978428,8.73486842 C16.8275284,4.32830497 24.0437763,2.3066124 30.8172363,5.29678046 Z"
                    fill="url(#linearGradient-144)"
                  />
                  <path
                    id="Path"
                    d="M44.2793921,5.11035563 C45.0148113,5.99650986 45.7276023,7.26586592 45.6597174,8.47534669 C46.4630216,7.12216523 46.7571893,5.80490895 45.7502306,4.91875472 C43.3516324,2.81114466 40.8851493,1.74536458 38.3620955,1.33821263 C40.5230967,2.47584306 42.6727838,3.17039638 44.2793921,5.11035563 Z"
                    fill="url(#linearGradient-145)"
                  />
                  <path
                    id="Path"
                    d="M52.2211188,10.6045553 C51.3072175,8.98606883 49.5301872,6.55833915 47.7023845,8.04781581 C47.5627607,8.16509744 47.4231369,8.28237907 47.2835131,8.39966069 C47.5119884,8.36447621 47.7404638,8.39966069 47.9181668,8.51694232 C49.7840486,9.7483994 50.3171577,11.9415658 50.7233361,13.9470816 C50.8248807,14.4162081 50.875653,14.8736065 50.9010391,15.342733 C51.7768612,15.3544612 52.6526833,15.4600146 53.5285054,15.6124807 C53.4904262,13.8532563 53.0715547,12.1292164 52.2211188,10.6045553 Z"
                    fill="url(#linearGradient-146)"
                  />
                  <path
                    id="Path"
                    d="M51.0840628,15.6124807 C51.2247922,18.1628001 50.439053,20.6663247 49.219398,23.0060673 C49.0200314,23.3921248 48.6447529,23.6845926 48.1756549,23.8483746 C48.5392059,24.0121566 48.8910294,24.1642398 49.2311255,24.2929257 C49.711951,24.4567077 50.2279589,24.6321883 50.7087844,24.4684064 C51.2130648,24.2929257 51.5179785,23.8015797 51.7759825,23.3336312 C52.9370002,21.1342732 53.5937375,18.4669667 53.5233727,15.8815511 C52.7024511,15.7294679 51.893257,15.6241795 51.0840628,15.6124807 Z"
                    fill="url(#linearGradient-147)"
                  />
                  <path
                    id="Path"
                    d="M46.1467758,26.5742265 C46.2398647,26.5974222 46.2980453,26.7134006 46.3445898,26.7481941 C47.1358457,27.2469014 47.8107404,28.0007612 47.5082014,28.9285886 C46.367862,32.3499522 43.8428248,34.8898798 41.0385208,37.0238829 C42.7490299,36.3744037 44.36645,35.539359 45.7744201,34.3331834 C47.6594709,32.7210832 49.1023493,30.5406888 49.8819691,28.1863267 C49.9517858,27.9775655 50.0099664,27.7340108 49.8936052,27.5484453 C49.7539718,27.3164884 49.4281606,27.2932928 49.1488938,27.2584992 C47.9271016,27.1541186 46.4725871,26.3654653 45.1577059,25.4260401 C45.4020644,25.8551602 45.6929673,26.2726826 46.1467758,26.5742265 Z"
                    fill="url(#linearGradient-148)"
                  />
                  <path
                    id="Path"
                    d="M20.2330506,32.3726993 C16.7867123,32.6540859 13.2792686,32.6418517 9.86959347,32.2136547 C9.46629855,31.8099262 9.11188787,31.430666 8.80636142,31.0758742 C7.98755054,30.1216067 7.21762389,29.0205287 7.14429754,27.7726404 C7.04652907,26.2678339 7.96310842,24.8853693 9.06300364,23.8576966 C10.1262357,22.8667264 11.4461099,22.0837377 12.8881948,21.9002247 C14.6846903,21.6677749 16.5300701,22.4018269 17.8377233,23.6497152 C19.1453765,24.8976035 19.9519663,26.6103914 20.318598,28.3843504 C20.5874613,29.6934097 20.6119034,31.1003426 20.2330506,32.3726993 Z"
                    fill="url(#linearGradient-149)"
                  />
                  <path
                    id="Path"
                    d="M20.5192604,31.828387 C20.3803893,32.252034 20.2036442,32.6635769 19.9637759,33.0509114 C17.2621013,37.4084241 12.6162311,34.3581652 9.81355932,31.6710324 C13.335836,32.0946794 16.9591098,32.1067836 20.5192604,31.828387 Z"
                    fill="url(#linearGradient-150)"
                  />
                  <path
                    id="Path"
                    d="M16.9692352,9.56266324 C17.8576935,11.1820032 18.657306,12.8496817 19.4442263,14.5173602 C20.2438388,16.1850387 20.9926822,17.8648019 21.6399876,19.5929035 C22.9092138,22.9403451 23.7595953,26.4328023 23.9245947,29.9977672 C23.9753638,30.9766219 23.9626715,31.9554767 23.9119025,32.9222469 C23.8865179,33.4056319 23.8357489,33.889017 23.7976721,34.3724021 C23.7849798,34.6140946 23.7595953,34.8678718 23.7469031,35.1095643 C23.7215185,35.3754261 23.7469031,35.6292033 23.7342108,35.8950651 C23.7215185,36.1367576 24.0895941,36.2334346 24.17844,35.9917421 C24.2545935,35.7863034 24.3688239,35.5929494 24.4322852,35.3754261 C24.4957465,35.1579028 24.5592078,34.9403795 24.6099769,34.7107716 C24.711515,34.2636404 24.7749763,33.8044246 24.8384376,33.3572934 C24.9399757,32.4751157 24.9907447,31.5929379 24.9780525,30.6986755 C24.9526679,28.8859815 24.7368995,27.0732875 24.3688239,25.2968473 C23.6072882,21.6835439 22.2492161,18.1790022 20.497684,14.8919837 C20.0026858,13.973552 19.4949953,13.0551204 18.9619203,12.160858 C18.4034608,11.2424264 17.8069245,10.348164 17.2357727,9.42973234 C17.1342346,9.29680145 16.8803893,9.39347846 16.9692352,9.56266324 L16.9692352,9.56266324 Z"
                    fill="url(#linearGradient-151)"
                  />
                  <path
                    id="Path"
                    d="M18.7523845,7.76478188 C19.7854634,9.39899757 20.7163696,11.092424 21.5337507,12.8450611 C22.3624844,14.5976982 23.1117504,16.3858617 23.7247862,18.2213939 C24.9395054,21.8687738 25.6320088,25.6937859 25.8590591,29.5424823 C25.9271742,30.6082751 25.9385267,31.6740679 25.9385267,32.7398608 C25.9385267,33.2964415 25.9385267,33.8530222 25.9385267,34.4096029 C25.9385267,34.67013 25.9385267,34.9424993 25.9498793,35.2030265 C25.9612318,35.4872379 25.9498793,35.7596072 25.9839368,36.0438186 C25.9952893,36.1503979 26.142872,36.16224 26.1769296,36.0675029 C26.3358648,35.6056593 26.4039799,35.1082893 26.5061525,34.6227615 C26.6083252,34.1609179 26.6423827,33.6635479 26.6764403,33.1898622 C26.7559079,32.2069644 26.7786129,31.2240665 26.7559079,30.2411687 C26.7218503,28.2516887 26.5288576,26.2740509 26.1882821,24.3082552 C25.5184837,20.4358745 24.3037645,16.575336 22.4987146,13.1055882 C21.4883407,11.1634768 20.2736215,9.32794471 18.9226722,7.62267616 C18.8318521,7.51609688 18.6842694,7.64636045 18.7523845,7.76478188 L18.7523845,7.76478188 Z"
                    fill="url(#linearGradient-152)"
                  />
                  <path
                    id="Path"
                    d="M20.5473511,6.86617079 C21.1588592,7.60134231 21.7115684,8.40765946 22.2642777,9.19026141 C22.8169869,9.97286335 23.3226571,10.7910381 23.8048077,11.6092129 C24.7926284,13.2692776 25.6510917,15.000488 26.3331585,16.802844 C27.7913701,20.6328504 28.4146379,24.7711547 28.5439954,28.8620285 C28.5792747,30.0359314 28.5792747,31.2098343 28.5439954,32.3955948 C28.5087161,33.5694977 28.4381575,34.7434006 28.4851966,35.9173036 C28.4851966,36.0477372 28.6380736,36.1425981 28.7439115,36.1307405 C28.8850288,36.1307405 28.9673472,36.024022 28.9908667,35.8935884 C29.2260621,34.8501191 29.3083805,33.7829346 29.3671794,32.7157502 C29.4259783,31.6722809 29.4494978,30.6406692 29.437738,29.5972 C29.4142185,27.4865463 29.284861,25.3640349 28.9555874,23.2652388 C28.3205598,19.233653 27.0269849,15.3087857 24.9102262,11.8226498 C24.6162319,11.3483456 24.3222376,10.885899 24.0047238,10.4234524 C23.6989697,9.97286335 23.3461766,9.55784717 23.0051432,9.14283099 C22.6641099,8.7159572 22.3230765,8.2653682 21.9114845,7.89778244 C21.7115684,7.71991836 21.5234121,7.50648147 21.3352557,7.30490218 C21.1353396,7.10332289 20.911904,6.91360121 20.7119879,6.72387952 C20.6179097,6.62901868 20.4532729,6.75945234 20.5473511,6.86617079 L20.5473511,6.86617079 Z"
                    fill="url(#linearGradient-153)"
                  />
                  <path
                    id="Path"
                    d="M24.1256528,6.12094034 C25.3576222,7.64564075 26.5895915,9.15861269 27.5912862,10.8475116 C28.592981,12.5364105 29.4449972,14.3308656 30.1243074,16.1722346 C31.471414,19.8315155 32.162238,23.7136373 32.1161831,27.6192161 C32.1046693,28.7216918 32.0355869,29.812439 31.9204496,30.9031862 C31.8628809,31.4426956 31.7937986,31.9939334 31.7016887,32.5334428 C31.6210926,33.0964091 31.5059552,33.6476469 31.5520102,34.2106132 C31.5635239,34.3513548 31.7707711,34.3982686 31.8513672,34.280984 C32.1161831,33.8470308 32.2543478,33.3661638 32.3694852,32.8735682 C32.4846225,32.3809727 32.5882461,31.8883772 32.6688422,31.3840532 C32.8300345,30.3871337 32.9336581,29.3784858 32.979713,28.3698378 C33.0718228,26.3525419 32.9451718,24.3235175 32.6458147,22.341407 C32.0355869,18.3654575 30.6654528,14.518521 28.5699535,11.1055378 C27.9827531,10.1438037 27.3379841,9.22898348 26.6586739,8.33762017 C25.96785,7.43452839 25.2309711,6.57835047 24.3789549,5.83945719 C24.2177627,5.69871562 23.9990018,5.95674184 24.1256528,6.12094034 L24.1256528,6.12094034 Z"
                    fill="url(#linearGradient-154)"
                  />
                  <path
                    id="Path"
                    d="M27.6774469,5.94713718 C28.3321588,6.69319715 28.9020007,7.51031044 29.4354697,8.35110818 C29.9568144,9.16822148 30.4902834,9.98533478 30.9510066,10.8379747 C31.8967016,12.5550969 32.6726565,14.3669568 33.2788713,16.2261856 C34.4670522,19.8854321 34.9277754,23.7933653 34.6125438,27.6184029 C34.5276737,28.7078873 34.3821822,29.7855295 34.1760691,30.8631716 C34.0790748,31.3723872 33.9699561,31.8816027 33.8365889,32.3908182 C33.7032216,32.9355604 33.4971086,33.5039871 33.5092329,34.0605715 C33.5092329,34.3092581 33.8244646,34.463207 33.9942047,34.2382048 C34.3094364,33.8237271 34.4549279,33.3145115 34.6125438,32.8171382 C34.7580353,32.3316071 34.8792783,31.8342338 35.0005212,31.3487027 C35.2308828,30.3894828 35.3884987,29.4184206 35.5097416,28.4473584 C35.7401032,26.4578652 35.7401032,24.4328452 35.5339902,22.443352 C35.1217642,18.4998922 33.9335832,14.6156435 31.9451988,11.1577147 C31.3874812,10.1866525 30.7691422,9.22743259 30.0780573,8.33926596 C29.3869725,7.45109934 28.5988933,6.64582826 27.8108141,5.82871496 C27.7380683,5.74581941 27.6047011,5.85239941 27.6774469,5.94713718 L27.6774469,5.94713718 Z"
                    fill="url(#linearGradient-155)"
                  />
                  <path
                    id="Path"
                    d="M32.1385179,8.63943024 C32.6361511,9.28756858 33.0159239,9.98284426 33.3956966,10.7016886 C33.7623737,11.3969643 34.1421464,12.09224 34.4564411,12.8110843 C35.0719348,14.2369887 35.5564724,15.7100304 35.8838627,17.2184251 C36.5779301,20.4119795 36.617217,23.6644555 36.381496,26.9051473 C36.3160179,27.8478939 36.2243486,28.7906406 36.1195837,29.721603 C36.0279144,30.6289967 35.8838627,31.5835277 35.9886276,32.4909214 C36.0017232,32.585196 36.1457749,32.585196 36.1850618,32.5027057 C36.5517389,31.736724 36.7088862,30.8764677 36.8660336,30.0633487 C37.0231809,29.226661 37.1410414,28.378189 37.2327107,27.5297169 C37.4160492,25.8445572 37.5077185,24.1476132 37.4553361,22.4506692 C37.4029536,20.8008625 37.2327107,19.1628401 36.8791292,17.5483864 C36.5386433,16.0046387 36.0802969,14.425538 35.3862295,12.9878493 C34.9933612,12.1747303 34.561206,11.38518 34.0504771,10.6191983 C33.5528439,9.86500093 32.8980634,9.19329391 32.2956652,8.50980257 C32.2170916,8.4155279 32.0599442,8.53337123 32.1385179,8.63943024 L32.1385179,8.63943024 Z"
                    fill="url(#linearGradient-156)"
                  />
                  <path
                    id="Path"
                    d="M36.60396,11.4228901 C36.8878471,11.9165805 37.1615954,12.3867617 37.3542331,12.9392247 C37.5468708,13.4916877 37.6786756,14.0794143 37.7902027,14.6553864 C38.0233957,15.9013667 38.1653393,17.1826107 38.297144,18.4521001 C38.5506147,21.0263426 38.5100594,23.6240941 38.2565887,26.1865821 C38.1856169,26.915363 38.0943675,27.644144 37.9828404,28.372925 C37.8713133,29.0899514 37.7395085,29.8069779 37.7090921,30.5357588 C37.6989532,30.8061131 37.9828404,30.8648857 38.0842286,30.6415496 C38.357977,30.030314 38.5100594,29.3838147 38.6418641,28.7138064 C38.7736688,28.0555526 38.8750571,27.3972988 38.9663066,26.7272905 C39.1386666,25.410783 39.229916,24.0825209 39.2501937,22.7425042 C39.290749,20.0389619 39.0271395,17.3471741 38.4188099,14.7259136 C38.2667275,14.0559052 38.0842286,13.3976515 37.8206191,12.7746613 C37.5772873,12.1869347 37.2528449,11.55219 36.77632,11.1760449 C36.6445153,11.0820087 36.5228494,11.2818357 36.60396,11.4228901 L36.60396,11.4228901 Z"
                    fill="url(#linearGradient-157)"
                  />
                  <path
                    id="Path"
                    d="M30.3328197,20.0731895 C28.4695536,22.0438853 26.194917,24.3221463 23.702496,25.5751899 C22.5651777,26.1447551 19.6008906,27.7737118 18.342581,27.0104943 C17.0721723,26.2358856 18.5361671,24.9372768 19.2863132,24.4132768 C22.5167812,22.180581 26.4610978,21.1097983 30.3328197,20.0731895 Z"
                    fill="url(#linearGradient-158)"
                  />
                  <circle
                    id="Oval"
                    cx="8.47534669"
                    cy="24.9799692"
                    fill="#000000"
                    r="2.23035439"
                  />
                  <circle
                    id="Oval"
                    cx="8.92141757"
                    cy="24.5338983"
                    fill="#FFFFFF"
                    r="1"
                  />
                </g>
              </g>
              <g
                id="Stars"
                stroke="#FFFFFF"
                strokeLinejoin="round"
                strokeWidth="7"
                transform="translate(172.183359, 0.000000)"
              >
                <polygon
                  id="Star"
                  points="34.7935285 75.3413713 14.3424056 84.3534865 16.5936919 62.118416 1.7029165 45.4531391 23.5454109 40.7232249 34.7935285 21.4114022 46.0416461 40.7232249 67.8841405 45.4531391 52.9933651 62.118416 55.2446514 84.3534865"
                />
                <polygon
                  id="Star-Copy"
                  points="124.899846 53.9299692 104.448723 62.9420844 106.700009 40.7070139 91.8092339 24.0417369 113.651728 19.3118228 124.899846 0 136.147964 19.3118228 157.990458 24.0417369 143.099683 40.7070139 145.350969 62.9420844"
                />
                <polygon
                  id="Star-Copy-2"
                  points="214.114022 75.3413713 193.662899 84.3534865 195.914185 62.118416 181.02341 45.4531391 202.865904 40.7232249 214.114022 21.4114022 225.362139 40.7232249 247.204634 45.4531391 232.313858 62.118416 234.565145 84.3534865"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default React.memo(Symbiosis);
