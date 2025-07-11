import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';
import './index.css';
function App() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const responseRef = useRef(null);
const apiKey = import.meta.env.VITE_API_KEY;
const baseUrl = import.meta.env.VITE_BASE_URL;
const siteTitle = import.meta.env.VITE_SITE_TITLE;
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
      setToastType('');
    }, 4000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!question.trim()) {
      newErrors.question = 'Please enter a medical question';
    } else if (question.trim().length < 10) {
      newErrors.question = 'Question must be at least 10 characters long';
    } else if (question.trim().length > 1000) {
      newErrors.question = 'Question must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix the errors in your question', 'error');
      return;
    }

    setResponse('');
    setLoading(true);
    showToast('Getting medical insights...', 'loading');

    try {
      const res = await fetch(`${baseUrl}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': `siteTitle`,
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful medical assistant. Provide informative responses but always remind users to consult healthcare professionals for medical advice. Keep responses concise and easy to understand.',
            },
            {
              role: 'user',
              content: question.trim(),
            },
          ],
          max_tokens: 512,
          temperature: 0.7,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const message = data.choices?.[0]?.message?.content?.trim();
      if (!message) throw new Error('No response received from the AI');

      setResponse(message);
      showToast('Response received successfully!', 'success');
    } catch (err) {
      let errorMessage = 'Failed to get response. Please try again.';
      if (err.message.includes('401')) errorMessage = 'Invalid API key.';
      else if (err.message.includes('429')) errorMessage = 'Too many requests. Please wait.';
      else if (err.message.includes('5')) errorMessage = 'Server error. Try again later.';
      else if (!navigator.onLine) errorMessage = 'No internet connection.';

      setResponse('');
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]);

  const clearForm = () => {
    setQuestion('');
    setResponse('');
    setErrors({});
    showToast('Form cleared', 'success');
  };

  const characterCount = question.length;
  const isNearLimit = characterCount > 800;

  const ToastComponent = () =>
    toastMessage && (
      <div className="fixed top-4 right-4 z-50">
        <div
          className={`px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${
            toastType === 'success'
              ? 'bg-green-600 text-white'
              : toastType === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          {toastType === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
          {toastType === 'success' && <CheckCircle className="w-5 h-5" />}
          {toastType === 'error' && <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 py-6 px-4 flex justify-center items-start md:items-center">
      <ToastComponent />

      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex gap-4  items-center justify-center mb-4">
           <img src="https://cdn-icons-png.flaticon.com/128/2779/2779107.png" alt="Logo" className="w-20 h-auto" />
           {/* <img src="/robotic.png" alt="Logo" className="w-32 h-auto" /> */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Medical Assistant</h1>
          </div>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Ask medical questions and get AI-powered insights.
          </p>
          <p className="text-amber-600 font-medium mt-2">
            ⚠️ Always consult healthcare professionals for medical advice
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                What's your medical question?
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What are the symptoms of dehydration?"
                rows={4}
                maxLength={1000}
                className={`w-full px-4 py-3 rounded-lg border-2 resize-none focus:outline-none focus:ring-2 ${
                  errors.question
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.question && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.question}
                </div>
              )}
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500">Minimum 10 characters</div>
                <div
                  className={`text-xs font-medium ${
                    isNearLimit ? 'text-amber-600' : 'text-gray-500'
                  }`}
                >
                  {characterCount}/1000
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Getting Response...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" /> Ask Question
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={clearForm}
                disabled={loading}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear
              </button>
            </div>
          </form>

          {response && (
            <div
              ref={responseRef}
              className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200 animate-fade-in-slide"
            >
              <div className="flex items-center mb-3">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">AI Response</h3>
              </div>
              <div className="text-gray-700 text-sm whitespace-pre-wrap">{response}</div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    <strong>Disclaimer:</strong> This information is for educational purposes only. Always consult a qualified healthcare professional.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by AI • For informational purposes only</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
