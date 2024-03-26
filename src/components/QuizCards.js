"use client";
import "../styles/fonts.module.css";
import React, { useState, useEffect, useCallback } from "react";
import style from "@/styles/QuizcardPopupsStyles.css";

const QuizCards = ({
  questions,
  videoDone,
  extractedAnswers,
  extractedBooleans,
  onQuizEnd,
}) => {
  const [answers, setAnswers] = useState(extractedAnswers || {});
  const [questionState, setQuestionState] = useState(extractedBooleans || {});
  const [isCheckButtonDisabled, setIsCheckButtonDisabled] = useState(true);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false); //Usesate for HistoryPopup
  const [showResultPopup, setShowResultPopup] = useState(false); //Usestate for  ResultPopup

  useEffect(() => {
    const hasAnswerForAllQuestions = questions.every(
      (question) =>
        answers[question.id] !== undefined && answers[question.id] !== null
    );

    if (
      Object.keys(extractedAnswers).length === 0 &&
      extractedAnswers.constructor === Object
    ) {
      setIsCheckButtonDisabled(!hasAnswerForAllQuestions);
    }
  }, [answers, questions]);

  const checkAnswer = useCallback(() => {
    if (videoDone) {
      const newQuestionState = { ...questionState };
      questions.forEach((question) => {
        extractedAnswers[question.id] = answers[question.id];
        const userAnswer = answers[question.id];
        if (userAnswer === question.answer) {
          newQuestionState[question.id] = true;
        } else {
          newQuestionState[question.id] = false;
        }
        setQuestionState(newQuestionState);
      });
      setIsCheckButtonDisabled(true);
      onQuizEnd(answers);
    } else {
      alert("Please watch the video first");
    }
  }, [answers, questionState, questions, videoDone]);

  //Function to trigger History and Result popup
  const toggleHistoryPopup = () => {
    setShowHistoryPopup(!showHistoryPopup);
  };

  const toggleResultPopup = () => {
    setShowResultPopup(!showResultPopup);
  };

  return (
    <div className="QuizCard">
      <div
        className="bg-black bg-opacity-50 rounded-4 p-2"
        style={{ height: "", width: "" }}
      >
        <button onClick={toggleHistoryPopup}>history </button>
        <h5
          className="fs-1 text-center text-capitalize fw-bold"
          style={{ fontFamily: "angrybird", color: "#DEDEDE" }}
        >
          Concept Check
        </h5>
        <button onClick={toggleResultPopup}>Result</button>

        <div className=" " style={{ height: "", width: "" }}>
          {questions.map((question) => {
            const options = JSON.parse(question.options);
            return (
              <div
                className="border border-secondary rounded-4 p-2 mt-4 text-start"
                key={question.id}
                style={{
                  backgroundColor:
                    questionState[question.id] === true
                      ? "#689C0D"
                      : questionState[question.id] === false
                      ? "#ff0000"
                      : "",
                  fontFamily: "quando",
                  color: "#E9EAEC",
                  fontSize: "14px",
                }}
              >
                {/*Question*/}
                <h5
                  className="fs-5 fw-bold"
                  style={{ fontFamily: "asul", color: "#D0D2D7" }}
                >
                  {question.question}
                </h5>
                <div className="text-capitalize">
                  {options.map((option, index) => (
                    <div key={index} className="mb-1">
                      <label htmlFor={question.id + index.toString()}>
                        <input
                          type="radio"
                          value={option}
                          id={question.id + index.toString()}
                          name={question.id}
                          onChange={() => {
                            setAnswers((prev) => ({
                              ...prev,
                              [question.id]: index,
                            }));
                          }}
                          defaultChecked={
                            extractedAnswers[question.id] == index
                          }
                          disabled={
                            extractedAnswers[question.id] !== undefined &&
                            extractedAnswers[question.id] !== null
                          }
                        />
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="d-grid mt-4">
          <button
            style={{ fontFamily: "quando", color: "", fontWeight: "bold" }}
            className="btn btn-success"
            type="button"
            onClick={checkAnswer}
            disabled={isCheckButtonDisabled}
          >
            Check Answer
          </button>
        </div>
      </div>
      {/* History Popup */}
      {showHistoryPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>History</h2>
            <button onClick={toggleHistoryPopup}>Close</button>
            {/* History content goes here */}
          </div>
        </div>
      )}

      {/* Result Popup */}
      {showResultPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Result</h2>
            <button onClick={toggleResultPopup}>Close</button>
            {/* Result content goes here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizCards;
