import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:8000/test")
      .then((res) => res.json())
      .then((data) => setMessage(data.reply))
      .catch((err) => {
        console.error(err);
        setMessage("Error connecting to backend");
      });
  }, []);

  return (
    <div>
      <h1>EduMind AI</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default App;
