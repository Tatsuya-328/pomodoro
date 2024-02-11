import React, { useState, useEffect, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./App.css";

const App = () => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [phase, setPhase] = useState("work");
  const [sessions, setSessions] = useState(0);
  const [timer, setTimer] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartValue, setDragStartValue] = useState(0);
  const [dragStartValueWhere, setDragStartValueWhere] = useState(0);
  const [dragStartValueSeconds, setDragStartValueSeconds] = useState(0);
  const containerRef = useRef(null);

  const getPercentage = () => {
    if (phase === "work") {
      return (seconds / (25 * 60)) * 100;
    } else {
      return (seconds / (5 * 60)) * 100;
    }
  };

  const getColor = () => {
    if (phase === "work") {
      return "#f87070";
    } else {
      return "#70f3f8";
    }
  };

  const getText = () => {
    if (phase === "work") {
      return "WORK";
    } else {
      return "BREAK";
    }
  };

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes < 10 ? "0" + minutes : minutes}:${secondsLeft < 10 ? "0" + secondsLeft : secondsLeft}`;
  };

  const startTimer = () => {
    if (timer) return;
    setTimer(
      setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000)
    );
  };

  const pauseTimer = () => {
    if (!timer) return;
    clearInterval(timer);
    setTimer(null);
  };

  const resetTimer = () => {
    clearInterval(timer);
    setTimer(null);
    setSeconds(25 * 60);
    setPhase("work");
    setSessions(0);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const deltaY = e.clientY - containerRef.current.getBoundingClientRect().top;
    setDragStartValue(seconds - Math.floor(deltaY / 60));
    setDragStartValueSeconds(Math.floor(seconds / 60) * 60);
    setDragStartValueWhere(Math.floor(deltaY / 60) * 60);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaY = e.clientY - containerRef.current.getBoundingClientRect().top;
      const hoge = Math.floor(deltaY / 60) * 60;
      const diffHoge = dragStartValueWhere - Math.floor(deltaY / 60) * 60;
      const newValue = dragStartValueSeconds + diffHoge;
      console.log(dragStartValueSeconds, diffHoge);
      changeSeconds(newValue);
    }
  };

  const changeSeconds = (value) => {
    if (value < 0) return;
    setSeconds(value);
  };

  useEffect(() => {
    if (seconds === 0) {
      if (phase === "work") {
        setPhase("break");
        setSeconds(5 * 60);
      } else {
        setPhase("work");
        setSeconds(25 * 60);
        setSessions((prevSessions) => prevSessions + 1);
      }
    }
  }, [seconds, phase]);

  return (
    <div className="container" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} ref={containerRef}>
      <h1>Pomodoro Timer</h1>
      <div className="timer" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
        <CircularProgressbar
          value={getPercentage()}
          text={formatTime()}
          styles={buildStyles({
            pathColor: getColor(),
            textColor: "white",
            trailColor: "transparent",
          })}
        />
        <div className="phase">{getText()}</div>
      </div>
      <div className="buttons">
        <button onClick={startTimer}>►</button>
        <button onClick={pauseTimer}>❚❚</button>
        <button onClick={resetTimer}>↻</button>
      </div>
      <div className="sessions">{sessions} of 2 sessions</div>
    </div>
  );
};

export default App;
