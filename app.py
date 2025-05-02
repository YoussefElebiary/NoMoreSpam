# File:           app.py
# Description:    This is the back-end for the NoMoreSpam web app
# Author:         Youssef Elebiary
# Version:        1.0


# Importing the libraries
from flask import Flask, render_template, request, jsonify    # Web server
from joblib import load    # Load the models
import re    # Regex matching
# Text preprocessing
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Download dependencies
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

# Creating the lemmatizer
lemmatizer = WordNetLemmatizer()

# Cleaning function
def clean(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9\s$€£¥!?]', '', text)
    return text

# Preprocessing function
def preprocess(text: str) -> str:
    text = clean(text)
    text = text.split()
    tokens = [lemmatizer.lemmatize(word) for word in text if word not in stopwords.words('english')]
    return ' '.join(tokens)

# Loading the model
MODEL = load("./models/model.pkl")

# Loading the vectorizer
VECTORIZER = load("./models/vectorizer.pkl")

# Creating the flask app
app = Flask(__name__)

# Home page rendering
@app.route('/')
def home():
    return render_template('index.html')

# Handling the request
@app.route('/request', methods=['POST'])
def handle_request():
    try:
        # Get the data from the request
        data = request.form.get('text')
        # Handling empty text
        if data == "":
            return jsonify({'error': 'Empty text'}), 400
        
        # Preprocessing the data
        processed = preprocess(data)
        # Vectorizing the data
        vectorized = VECTORIZER.transform([processed])
        
        # Making the prediction
        prediction = MODEL.predict_proba(vectorized)[0][1]
        
        # Returning the prediction
        return jsonify({'percentage': float(prediction)}), 200
    except Exception as e:
        print("ERR")
        return jsonify({'error': str(e)}), 500