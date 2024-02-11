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
  const [MaxSeconds, setMaxSeconds] = useState(initialPhase === "work" ? initialWorkMaxSeconds : initialBreakMaxSeconds); // 修正: phaseに応じてMaxSecondsの初期値を設定
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
      setMaxSeconds(workMaxSeconds);
    } else {
      setSeconds(breakMaxSeconds);
      setMaxSeconds(breakMaxSeconds);
    }
  }, [phase, workMaxSeconds, breakMaxSeconds]);

  const getPercentage = () => {
    return isDragging ? 100 : (initialWorkMaxSeconds / initialWorkMaxSeconds) * 100;
  };

  const getColor = () => {
    return "#3591c1";
    // return isDragging ? "rgba(53, 145, 193, 0.5)" : "rgba(53, 145, 193, 1)"; // 進行状況の色を薄くする
  };
  const getTextColor = () => {
    return isDragging ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 1)"; // 数字の色を薄くする
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
      // setMaxSeconds(seconds); // 追加: タイマーを開始する前に最大秒数を現在の秒数に設定
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
      // setMaxSeconds(workMaxSeconds);
    } else {
      setSeconds(breakMaxSeconds);
      // setMaxSeconds(breakMaxSeconds);
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
    console.log(seconds);
    if (timer) return;
    setIsDragging(false);
    if (phase === "work") {
      setSeconds(seconds); // 追加: "WORK"の値を更新
      setWorkMaxSeconds(seconds);
    } else {
      setSeconds(seconds); // 追加: "BREAK"の値を更新
      setBreakMaxSeconds(seconds);
    }
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
      // setMaxSeconds(5 * 60);
    } else {
      setPhase("work");
      setSeconds(25 * 60);
      // setMaxSeconds(25 * 60);
      // setSessions((prevSessions) => prevSessions + 1);
    }
  }, [seconds, phase, isDragging]); // 追加: isDraggingを依存関係に追加

  return (
    <div className="container" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} ref={containerRef}>
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
          WORK
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
        <button onMouseUp={(e) => e.stopPropagation()} onClick={toggleTimer}>
          {timer ? "❚❚" : "►"}
        </button>
        <button onMouseUp={(e) => e.stopPropagation()} onClick={resetTimer}>
          ↻
        </button>
      </div>
    </div>
  );
};

export default App;
