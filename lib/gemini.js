import { GoogleGenerativeAI } from "@google/generative-ai"

// Use the provided Gemini API key
const API_KEY = "AIzaSyBGvnXCKXZ1nZxSDF3N2Em54k8zVZJs4jk"
const genAI = new GoogleGenerativeAI(API_KEY)

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
}

// Exponential backoff delay
const getRetryDelay = (attempt) => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt)
  return Math.min(delay, RETRY_CONFIG.maxDelay)
}

// Sleep utility
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Enhanced error handling
const handleGeminiError = (error) => {
  console.error("Gemini API Error:", error)

  if (error.message?.includes("overloaded") || error.message?.includes("503")) {
    return {
      type: "OVERLOADED",
      message: "Gemini AI is currently experiencing high traffic. Please try again in a moment.",
      retryable: true,
    }
  } else if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("401")) {
    return {
      type: "AUTH_ERROR",
      message: "Invalid API key. Please check your Gemini API configuration.",
      retryable: false,
    }
  } else if (error.message?.includes("QUOTA_EXCEEDED") || error.message?.includes("429")) {
    return {
      type: "QUOTA_ERROR",
      message: "API quota exceeded. Please try again later.",
      retryable: true,
    }
  } else if (error.message?.includes("SAFETY")) {
    return {
      type: "SAFETY_ERROR",
      message: "Content was blocked by Gemini's safety filters. Please rephrase your message.",
      retryable: false,
    }
  } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
    return {
      type: "NETWORK_ERROR",
      message: "Network connection issue. Please check your internet connection.",
      retryable: true,
    }
  } else {
    return {
      type: "UNKNOWN_ERROR",
      message: "An unexpected error occurred. Please try again.",
      retryable: true,
    }
  }
}

// Retry wrapper function
const withRetry = async (operation, context = "") => {
  let lastError = null

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = getRetryDelay(attempt - 1)
        console.log(`${context} - Retry attempt ${attempt} after ${delay}ms delay`)
        await sleep(delay)
      }

      return await operation()
    } catch (error) {
      lastError = error
      const errorInfo = handleGeminiError(error)

      console.log(`${context} - Attempt ${attempt + 1} failed:`, errorInfo.message)

      // Don't retry if error is not retryable
      if (!errorInfo.retryable) {
        throw new Error(errorInfo.message)
      }

      // Don't retry on last attempt
      if (attempt === RETRY_CONFIG.maxRetries) {
        throw new Error(errorInfo.message)
      }
    }
  }

  // This should never be reached, but just in case
  const errorInfo = handleGeminiError(lastError)
  throw new Error(errorInfo.message)
}

export const generateResponse = async (message, imageData = null) => {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    })

    let prompt = message
    const parts = [{ text: prompt }]

    // If image is provided, include it in the request
    if (imageData) {
      const base64Data = imageData.split(",")[1]
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      })
      prompt = `Please analyze this image and respond to: ${message}`
      parts[0] = { text: prompt }
    }

    const result = await model.generateContent(parts)
    const response = await result.response
    return response.text()
  }, "generateResponse")
}

export const generateStreamResponse = async (message, imageData = null, onChunk) => {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    })

    let prompt = message
    const parts = [{ text: prompt }]

    if (imageData) {
      const base64Data = imageData.split(",")[1]
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      })
      prompt = `Please analyze this image and respond to: ${message}`
      parts[0] = { text: prompt }
    }

    const result = await model.generateContentStream(parts)

    let fullResponse = ""
    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      fullResponse += chunkText
      if (onChunk) {
        onChunk(chunkText)
      }
    }

    return fullResponse
  }, "generateStreamResponse")
}

// Test function with better error handling
export const testGeminiConnection = async () => {
  try {
    console.log("Testing Gemini API connection...")

    const result = await withRetry(async () => {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50, // Smaller for test
        },
      })

      const result = await model.generateContent("Say 'Hello' in one word.")
      const response = await result.response
      return response.text()
    }, "testGeminiConnection")

    console.log("✅ Gemini API Test Successful:", result)
    return { success: true, message: result }
  } catch (error) {
    console.error("❌ Gemini API Test Failed:", error.message)
    return { success: false, error: error.message }
  }
}

// Fallback response generator for when API fails
export const generateFallbackResponse = (message, isImage = false) => {
  const fallbackResponses = {
    greeting: [
      "Hello! I'm having trouble connecting to my AI service right now, but I'm here to help once the connection is restored.",
      "Hi there! I'm experiencing some technical difficulties, but I'll be back to full functionality soon.",
    ],
    question: [
      "That's an interesting question! Unfortunately, I'm having connectivity issues right now. Please try asking again in a moment.",
      "I'd love to help with that, but I'm currently experiencing some technical difficulties. Please try again shortly.",
    ],
    image: [
      "I can see you've shared an image, but I'm having trouble with my image analysis service right now. Please try again in a few moments.",
      "Image received! However, I'm experiencing some technical issues with image processing. Please try again shortly.",
    ],
    default: [
      "I'm currently experiencing some technical difficulties connecting to my AI service. Please try again in a moment.",
      "Sorry, I'm having trouble processing your request right now due to high server load. Please try again shortly.",
      "I'm temporarily unable to provide a response due to technical issues. Please try again in a few moments.",
    ],
  }

  let responseType = "default"

  if (isImage) {
    responseType = "image"
  } else if (message.toLowerCase().match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    responseType = "greeting"
  } else if (
    message.includes("?") ||
    message.toLowerCase().startsWith("what") ||
    message.toLowerCase().startsWith("how")
  ) {
    responseType = "question"
  }

  const responses = fallbackResponses[responseType]
  return responses[Math.floor(Math.random() * responses.length)]
}
