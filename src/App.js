import React, { useState, useEffect, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./App.css";
import Cookies from "js-cookie"; // js-cookie ライブラリをインポート

const App = () => {
  // クッキーから値を取得し、存在しない場合はデフォルト値を設定
  const initialWorkMaxSeconds = parseInt(Cookies.get("workMaxSeconds")) || 25 * 60;
  const initialBreakMaxSeconds = parseInt(Cookies.get("breakMaxSeconds")) || 5 * 60;
  const initialPhase = Cookies.get("phase") || "work"; // 追加: phaseをクッキーから取得

  const [seconds, setSeconds] = useState(initialPhase === "work" ? initialWorkMaxSeconds : initialBreakMaxSeconds); // 修正: phaseに応じてsecondsの初期値を設定
  const [workMaxSeconds, setWorkMaxSeconds] = useState(initialWorkMaxSeconds);
  const [breakMaxSeconds, setBreakMaxSeconds] = useState(initialBreakMaxSeconds);
  const [phase, setPhase] = useState(initialPhase); // 修正: phaseの初期値をクッキーから取得した値に設定
  const [timer, setTimer] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartValueWhere, setDragStartValueWhere] = useState(0);
  const [dragStartValueSeconds, setDragStartValueSeconds] = useState(0);
  const containerRef = useRef(null);

  // workMaxSecondsとbreakMaxSecondsが変更されたときにクッキーを更新
  useEffect(() => {
    Cookies.set("workMaxSeconds", workMaxSeconds, { expires: 365 });
    Cookies.set("breakMaxSeconds", breakMaxSeconds, { expires: 365 });
    Cookies.set("phase", phase, { expires: 365 }); // 追加: phaseをクッキーに保存
  }, [workMaxSeconds, breakMaxSeconds, phase]); // 修正: phaseを依存関係に追加

  // phaseが変更されたときにsecondsとMaxSecondsを更新
  useEffect(() => {
    if (phase === "work") {
      setSeconds(workMaxSeconds);
    } else {
      setSeconds(breakMaxSeconds);
    }
  }, [phase, workMaxSeconds, breakMaxSeconds]);

  const getPercentage = () => {
    return isDragging ? 100 : (seconds / (phase === "work" ? workMaxSeconds : breakMaxSeconds)) * 100;
  };

  const getColor = () => {
    // return "#2da7ff";
    return "rgb(30 103 157)";
    // return isDragging ? "rgba(53, 145, 193, 0.5)" : "rgba(53, 145, 193, 1)"; // 進行状況の色を薄くする
  };
  const getTextColor = () => {
    return isDragging ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.7)"; // 数字の色を薄くする
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
    if (phase === "work") {
      setSeconds(workMaxSeconds);
    } else {
      setSeconds(breakMaxSeconds);
    }
    // setSessions(0);
  };

  const switchPhase = (newPhase) => {
    if (newPhase === "work") {
      setSeconds(workMaxSeconds);
    } else {
      setSeconds(breakMaxSeconds);
    }
    setPhase(newPhase);
  };

  const handleMouseDown = (e) => {
    if (timer) return;
    setIsDragging(true);
    const deltaY = e.clientY - containerRef.current.getBoundingClientRect().top;
    // setDragStartValue(seconds - Math.floor(deltaY / 6));
    setDragStartValueSeconds(Math.floor(seconds / 60) * 60);
    setDragStartValueWhere(Math.floor(deltaY / 6) * 60);
  };

  const handleMouseUp = () => {
    // console.log(seconds);
    if (timer) return;
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaY = e.clientY - containerRef.current.getBoundingClientRect().top;
      const diffHoge = dragStartValueWhere - Math.floor(deltaY / 6) * 60;
      let newValue = dragStartValueSeconds + diffHoge;
      if (deltaY <= 30 || deltaY >= window.innerHeight - 30 || e.clientX <= 30 || e.clientX >= window.innerWidth - 30) {
        setIsDragging(false);
        return;
      }
      if (newValue <= 0) {
        newValue = 60;
      }
      changeSeconds(newValue);
      if (phase === "work") {
        setSeconds(newValue); // 追加: "WORK"の値を更新
        setWorkMaxSeconds(newValue);
      } else {
        setSeconds(newValue); // 追加: "BREAK"の値を更新
        setBreakMaxSeconds(newValue);
      }
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
    } else {
      setPhase("work");
      setSeconds(25 * 60);
      // setSessions((prevSessions) => prevSessions + 1);
    }
  }, [seconds, phase, isDragging]); // 追加: isDraggingを依存関係に追加

  return (
    <div className="container" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} ref={containerRef}>
      <div className="timer" style={{ cursor: timer ? "default" : "ns-resize" }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
        <CircularProgressbar
          value={getPercentage()}
          text={formatTime()}
          styles={buildStyles({
            pathColor: getColor(),
            textColor: getTextColor(), // 追加: textColorを動的に設定
            trailColor: "rgba(30,103,157,0.3)",
          })}
        />
      </div>
      <div className="buttons">
        <button onMouseUp={(e) => e.stopPropagation()} onClick={resetTimer}>
          <svg xmlns="http://www.w3.org/2000/svg" width="35" height="60" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
          </svg>
        </button>
        <button onMouseUp={(e) => e.stopPropagation()} onClick={toggleTimer}>
          {timer ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="60" fill="currentColor" className="bi bi-pause" viewBox="0 0 16 16">
              <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="40" fill="currentColor" className="bi bi-caret-right" viewBox="0 0 16 16">
              <path d="M6 12.796V3.204L11.481 8zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753" />
            </svg>
          )}
        </button>
      </div>
      <div className="phase-selector">
        <div
          className={`phase ${phase === "work" ? "active" : ""}`}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={() => {
            if (!timer) {
              setSeconds(25 * 60);
              switchPhase("work");
            }
          }}
        >
          FOCUS
        </div>
        <div
          className={`phase ${phase === "break" ? "active" : ""}`}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={() => {
            if (!timer) {
              switchPhase("break");
            }
          }}
        >
          {" "}
          {/* 追加: "BREAK"の値をリセット */}
          BREAK
        </div>
      </div>
    </div>
  );
};

export default App;
