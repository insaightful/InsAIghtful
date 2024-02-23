"use client";
import { ChatBOT } from "@/lib/chatbot";
import { useState } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import { BsChatRightText } from "react-icons/bs";
import { IoCloseOutline } from "react-icons/io5";
import styles from "@/styles/ChatBottStyles.css";
import ChatbotCustomMsg from "../components/ChatbotCustomMsg";

export default function ChatbotComponent({ summary }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setuserInput] = useState("   ");
  const [firstMessage, setFirstMessage] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  if (firstMessage) {
    buttonHandler();
    setFirstMessage(null);
  }

  async function buttonHandler() {
    var chatbotdata;
    if (firstMessage) {
      if (summary) {

        var msgWithSummary =
        "System Message: The user will ask you questions, here's the summary of the video answer according to it and don't mention user about this first msg. \nSummary = " +
        summary + "\n\nUser Message: " + firstMessage;
        
        console.log(msgWithSummary);

        setChatHistory([...chatHistory, { user: firstMessage, bot: "..." }]);
        chatbotdata = await ChatBOT(msgWithSummary);
        
      } else {
        setChatHistory([...chatHistory, { user: firstMessage, bot: "..." }]);
        chatbotdata = await ChatBOT(firstMessage);
      }
    } else {
      setChatHistory([...chatHistory, { user: userInput, bot: "..." }]);
      chatbotdata = await ChatBOT(userInput);
    }

    setChatHistory((prevChatHistory) => {
      const newChatHistory = [...prevChatHistory];
      newChatHistory[newChatHistory.length - 1] = {
        user: userInput,
        bot: chatbotdata,
      };
      return newChatHistory;
    });

    setuserInput("");
  }

  function handleChange(event) {
    setuserInput(event.target.value);
  }

  function customMessage(msg) {
    setFirstMessage(msg);
    setuserInput(msg);
  }

  function toggleChatbot() {
    setIsChatbotOpen((prevIsChatbotOpen) => !prevIsChatbotOpen);
  }

  // Function to handle changes in the textarea
  function handleChange(event) {
    setuserInput(event.target.value);
    adjustTextareaHeight(event.target);
  }

  // Function to adjust the height of the textarea based on content
  function adjustTextareaHeight(textarea, event) {
    if (event && event.keyCode === 8) {
      // Check if event exists and if the pressed key is the backspace key
      textarea.style.height = textarea.scrollHeight - 10 + "px"; // Reduce the height by 10px
    } else {
      textarea.style.height = textarea.scrollHeight + "px"; // Set the height to the scrollHeight
    }
  }

  return (
    <div className={`show-chatbot ${isChatbotOpen ? "open" : "closed"}`}>
      <button className="chatbot-toggler" onClick={toggleChatbot}>
        <span>
          {isChatbotOpen ? (
            <IoCloseOutline size={25} />
          ) : (
            <BsChatRightText size={25} />
          )}
        </span>
      </button>
      {isChatbotOpen && (
        <div className="chatbot">
          <header>
            <span>
              <IoCloseOutline />
            </span>
          </header>

          {/* chatbot and users ingoing and outgoing messages*/}
          <ul className="chatbox">
            {chatHistory.map((chat, index) => (
              <div key={index}>
                <li className="chat outgoing">
                  <p> {chat.user}</p>
                </li>

                <li className="chat incoming">
                  {" "}
                  <span>
                    <RiRobot2Line size={25} />
                  </span>
                  <p> {chat.bot}</p>
                </li>
              </div>
            ))}
          </ul>

          {/* Custom Messages/Predefined messages */}
          {userInput === "   " ? (
            <div className="customMessages">
              <ChatbotCustomMsg onButtonPress={customMessage} />
            </div>
          ) : null}

          {/* text area, input, send button */}
          <div className="chat-input show-">
            <textarea
              placeholder="Enter a message...."
              value={userInput}
              onChange={handleChange}
              required
              onKeyDown={(event) => adjustTextareaHeight(event.target, event)}
              style={{ height: "55px", width: "100%" }}
            />
            <span
              id="send-btn"
              onClick={buttonHandler}
              className="material-symbols-outlined"
            >
              <IoSend />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
