import React, { useState, useEffect, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./App.css";

const App = () => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [maxSeconds, setMaxSeconds] = useState(25 * 60);
  const [phase, setPhase] = useState("work");
  const [sessions, setSessions] = useState(0);
  const [timer, setTimer] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartValue, setDragStartValue] = useState(0);
  const [dragStartValueWhere, setDragStartValueWhere] = useState(0);
  const [dragStartValueSeconds, setDragStartValueSeconds] = useState(0);
  const containerRef = useRef(null);

  const getPercentage = () => {
    return isDragging ? 100 : (seconds / maxSeconds) * 100;
  };

  const getColor = () => {
    sessions;
    dragStartValue;
    return "#3591c1";
    // return isDragging ? "rgba(53, 145, 193, 0.5)" : "rgba(53, 145, 193, 1)"; // 進行状況の色を薄くする
  };
  const getTextColor = () => {
    return isDragging ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 1)"; // 数字の色を薄くする
  };

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes < 10 ? "0" + minutes : minutes}:${secondsLeft < 10 ? "0" + secondsLeft : secondsLeft}`;
  };

  const toggleTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    } else {
      setMaxSeconds(seconds); // 追加: タイマーを開始する前に最大秒数を現在の秒数に設定
      setTimer(
        setInterval(() => {
          setSeconds((prevSeconds) => prevSeconds - 1);
        }, 1000)
      );
    }
  };

  const resetTimer = () => {
    clearInterval(timer);
    setTimer(null);
    setSeconds(25 * 60);
    setMaxSeconds(25 * 60);
    setPhase("work");
    setSessions(0);
  };

  const handleMouseDown = (e) => {
    if (timer) return;
    setIsDragging(true);
    const deltaY = e.clientY - containerRef.current.getBoundingClientRect().top;
    setDragStartValue(seconds - Math.floor(deltaY / 6));
    setDragStartValueSeconds(Math.floor(seconds / 60) * 60);
    setDragStartValueWhere(Math.floor(deltaY / 6) * 60);
  };

  const handleMouseUp = () => {
    if (timer) return;
    setIsDragging(false);
    setMaxSeconds(seconds);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaY = e.clientY - containerRef.current.getBoundingClientRect().top;
      const diffHoge = dragStartValueWhere - Math.floor(deltaY / 6) * 60;
      let newValue = dragStartValueSeconds + diffHoge;
      if (newValue <= 0) {
        newValue = 60;
      }
      changeSeconds(newValue);
    }
  };

  const changeSeconds = (value) => {
    if (value < 0) return;
    setSeconds(value);
  };

  useEffect(() => {
    if (seconds > 0 || isDragging) return; // 追加: ドラッグ中は何もしない
    if (phase === "work") {
      setPhase("break");
      setSeconds(5 * 60);
      setMaxSeconds(5 * 60);
    } else {
      setPhase("work");
      setSeconds(25 * 60);
      setMaxSeconds(25 * 60);
      setSessions((prevSessions) => prevSessions + 1);
    }
  }, [seconds, phase, isDragging]); // 追加: isDraggingを依存関係に追加

  return (
    <div className="container" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} ref={containerRef}>
      <div className="phase-selector">
        <div
          className={`phase ${phase === "work" ? "active" : ""}`}
          onClick={() => {
            if (!timer) setPhase("work");
          }}
        >
          WORK
        </div>
        <div
          className={`phase ${phase === "break" ? "active" : ""}`}
          onClick={() => {
            if (!timer) setPhase("break");
          }}
        >
          BREAK
        </div>
      </div>
      <div className="timer" style={{ cursor: timer ? "default" : "ns-resize" }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
        <CircularProgressbar
          value={getPercentage()}
          text={formatTime()}
          styles={buildStyles({
            pathColor: getColor(),
            textColor: getTextColor(), // 追加: textColorを動的に設定
            trailColor: "rgba(53, 145, 193, 0.2)", // 背景色を追加
          })}
        />
      </div>
      <div className="buttons">
        <button onClick={toggleTimer}>{timer ? "❚❚" : "►"}</button>
        <button onClick={resetTimer}>↻</button>
      </div>
    </div>
  );
};

export default App;
