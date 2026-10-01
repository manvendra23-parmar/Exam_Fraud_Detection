# Online Assessment Monitoring System

## Description

This project presents a **secure and intelligent online examination system** powered by **Artificial Intelligence (AI)** and **Machine Learning (ML)**.

With the rapid rise of online education, maintaining **fairness, credibility, and integrity** in assessments has become critical. This system addresses these challenges by detecting **suspicious activities in real time** using **biometric verification**, **behavioral analysis**, and **video monitoring**.

It is specifically designed for **educational institutions** conducting **large-scale online examinations**, ensuring a **reliable and scalable solution** for modern digital assessments.

---


## Demo

**Live Project:-**
Explore the deployed application here:
**https://exam-fraud-detection-6i7f.vercel.app/**

---

## Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/repo-name.git
   ```

2. Navigate to the project directory

   ```bash
   cd repo-name
   ```

3. Install dependencies

   ```bash
   npm install
   ```

4. Run the application

   ```bash
   npm start
   ```

---

## Usage

⚠️⚠️ **Note:** This is a **modular implementation**, where each feature (video analysis, tab detection, etc.) is developed as **separate functional components**, rather than a fully integrated production system.

* **User Authentication**
  Register/Login using Firebase authentication.

* **System Compatibility Check**
  Ensures the user’s system (camera, browser, permissions) is ready for monitoring.

* **Video Recording & Processing**
  Captures exam session video and sends it to **Google Cloud Video Intelligence API** for analysis.

* **AI-Based Analysis**
  The system processes recorded video to:

  * Detect **faces and multiple persons**
  * Identify **objects and labels** (unauthorized items)
  * Convert **speech to text** for audio monitoring

* **Browser Activity Monitoring**
  Tracks **tab and window switching** during the session.

* **Fraud Indicators**
  Flags suspicious activities based on:

  * Presence of multiple faces
  * Unauthorized objects
  * Tab switching behavior
  * Unusual audio patterns
---

## References

The development of this project was supported by the following resources:

* 📄 **Google Cloud Video Intelligence API Documentation**
  https://cloud.google.com/video-intelligence/docs
  Used for **video analysis, object detection, and label extraction**.

* 📑 **Research Papers on AI-based Fraud Detection**
  https://www.researchgate.net/
  Referenced for understanding **machine learning techniques in fraud detection systems**.

* 📘 **Plagiarism & Online Cheating Detection Studies (SciTePress)**
  https://www.scitepress.org/
  Provided insights into **behavior analysis and cheating detection methodologies**.

* 🔍 **Firebase Documentation**
  https://firebase.google.com/docs
  Used for **authentication and database integration**.

---


## Credits / Acknowledgments

This project was developed through the collaborative efforts of:

* **Devika Verma (UI22EC19)**
* **Aman Parmar (UI22EC07)**

### 🎓 Guidance & Mentorship

This work was carried out under the supervision of:

**Dr. Sudeep Sharma**
*Associate Professor, IIIT Surat*

---

We sincerely thank our mentor for their continuous guidance, support, and valuable insights throughout the development of this project.
