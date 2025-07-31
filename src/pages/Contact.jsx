import React, { useState } from 'react';
import { validationRules, validateForm } from '../utils/validation';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation schema for Contact form
  const validationSchema = {
    name: [validationRules.name],
    email: [validationRules.email],
    subject: [validationRules.select],
    message: [validationRules.required, validationRules.textLength]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const fieldErrors = validateForm({ [name]: value }, { [name]: validationSchema[name] });
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ name: true, email: true, subject: true, message: true });
    
    // Validate entire form
    const formErrors = validateForm(form, validationSchema);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      return;
    }
    
    console.log('Contact form submitted:', form);
    // Handle form submission
  };

  const contactMethods = [
    {
      title: 'General Support',
      description: 'For general questions and platform support',
      email: 'support@mindease.com',
      phone: '+94 768130758',
      icon: '💬'
    },
    {
      title: 'Technical Issues',
      description: 'For technical problems and bug reports',
      email: 'tech@mindease.com',
      phone: '+94 768130759',
      icon: '🔧'
    },
    {
      title: 'Mental Health Crisis',
      description: 'For immediate mental health support',
      email: 'crisis@mindease.com',
      phone: '+94 768130760',
      icon: '🚨'
    }
  ];

  const faqs = [
    {
      question: 'How do I get started with the platform?',
      answer: 'Simply sign up for an account, complete your profile, and start tracking your daily activities. Our AI assistant will guide you through the process.'
    },
    {
      question: 'Is my data secure and private?',
      answer: 'Yes, we use industry-standard encryption and follow strict privacy protocols. Your mental health data is protected and never shared without your consent.'
    },
    {
      question: 'How much does the platform cost?',
      answer: 'We offer various pricing plans starting from free basic access to premium features. Contact our sales team for detailed pricing information.'
    },
    {
      question: 'Can I speak with a real person?',
      answer: 'Absolutely! While our AI assistant is available 24/7, you can also connect with our team of mental health professionals through the psychiatrists page.'
    }
  ];

  return (
    <div className="bg-[#EDF4FA] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#212121] mb-4">Contact Us</h1>
          <p className="text-xl text-[#4F4F4F] max-w-3xl mx-auto">
            We're here to help! Reach out to us for support, questions, or feedback about our mental wellness platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-md">
            <h2 className="text-2xl font-bold text-[#212121] mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#212121] mb-1">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      touched.name && errors.name 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Your full name"
                  />
                  {touched.name && errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#212121] mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      touched.email && errors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {touched.email && errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-[#212121] mb-1">Subject <span className="text-red-500">*</span></label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    touched.subject && errors.subject 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                  <option value="feedback">Feedback</option>
                  <option value="crisis">Mental Health Crisis</option>
                </select>
                {touched.subject && errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                )}
              </div>

              <div>
                <label className="block text-[#212121] mb-1">Message <span className="text-red-500">*</span></label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  rows="5"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    touched.message && errors.message 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Tell us how we can help you..."
                />
                {touched.message && errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#212121] text-white py-3 rounded-lg hover:bg-[#333] transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Methods */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-bold text-[#212121] mb-6">Get in Touch</h2>
              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-xl">{method.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#212121] mb-1">{method.title}</h3>
                      <p className="text-sm text-[#4F4F4F] mb-2">{method.description}</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Email:</span> {method.email}</p>
                        <p><span className="font-medium">Phone:</span> {method.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h3 className="text-xl font-bold text-[#212121] mb-4">Office Hours</h3>
              <div className="space-y-2 text-[#4F4F4F]">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>Closed</span>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm">
                    <strong>Emergency Support:</strong> Available 24/7 for mental health crises
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-[#212121] text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#212121] mb-2">{faq.question}</h3>
                <p className="text-sm text-[#4F4F4F]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">🚨 Emergency Mental Health Support</h3>
          <p className="text-red-700 mb-4">
            If you're experiencing a mental health crisis or having thoughts of self-harm, please contact these resources immediately:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-red-800">National Crisis Hotline:</p>
              <p className="text-red-700">+94 768130760</p>
            </div>
            <div>
              <p className="font-medium text-red-800">Crisis Text Line:</p>
              <p className="text-red-700">Text HOME to 741741</p>
            </div>
            <div>
              <p className="font-medium text-red-800">Emergency Services:</p>
              <p className="text-red-700">+94 768130761 (if immediate danger)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 