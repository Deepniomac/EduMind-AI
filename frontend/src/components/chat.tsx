import { useState } from "react"

function Chat() {

  const [question,setQuestion] = useState("")
  const [response,setResponse] = useState("")

  const askAI = async () => {
    try{
      const res = await fetch("http://127.0.0.1:8000/test")
      const data = await res.json()
      setResponse(data.reply)
    }
    catch{
      setResponse("Backend not connected")
    }
  }

  return (
    <div style={{textAlign:"center",marginTop:"40px"}}>

      <input
        type="text"
        placeholder="Ask your study question..."
        value={question}
        onChange={(e)=>setQuestion(e.target.value)}
        style={{
          width:"300px",
          padding:"10px",
          fontSize:"16px"
        }}
      />

      <button
        onClick={askAI}
        style={{
          marginLeft:"10px",
          padding:"10px 20px",
          background:"#1565C0",
          color:"white",
          border:"none",
          cursor:"pointer"
        }}
      >
        Ask
      </button>

      <div style={{
        marginTop:"30px",
        background:"#f5f5f5",
        padding:"20px",
        width:"400px",
        marginLeft:"auto",
        marginRight:"auto",
        borderRadius:"8px"
      }}>
        <b>Response:</b>
        <p>{response}</p>
      </div>

    </div>
  )
}

export default Chat