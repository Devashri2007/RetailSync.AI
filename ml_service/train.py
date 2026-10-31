"""
RetailSync AI - Machine Learning Model Training Pipeline
Trains:
1. Demand Forecasting Regressor (Scikit-Learn GradientBoostingRegressor)
2. Customer Churn Risk Classifier (Scikit-Learn RandomForestClassifier)
3. Product Return Risk Classifier (Scikit-Learn GradientBoostingClassifier)
Saves models to saved_models/ directory using Joblib.
"""

import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, accuracy_score, classification_report

MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_demand_model():
    print("[1/3] Training Demand Forecasting Model...")
    np.random.seed(42)
    n_samples = 2500

    # Synthetic realistic feature generation:
    # 0: category_encoded (0=Electronics, 1=Apparel, 2=Footwear, 3=Home, 4=Beauty, 5=Accessories, 6=Sports)
    # 1: price (10 to 300)
    # 2: past_7d_sales (0 to 60)
    # 3: past_14d_sales (0 to 120)
    # 4: discount_rate (0 to 0.4)
    # 5: day_of_week (0 to 6)
    categories = np.random.randint(0, 7, n_samples)
    prices = np.random.uniform(15, 250, n_samples)
    past_7d = np.random.poisson(lam=18, size=n_samples)
    past_14d = past_7d * 2 + np.random.normal(0, 4, n_samples)
    past_14d = np.maximum(0, past_14d)
    discounts = np.random.choice([0.0, 0.05, 0.1, 0.15, 0.2, 0.3], n_samples)
    day_of_week = np.random.randint(0, 7, n_samples)

    # Ground truth: next 7 days demand
    base_demand = (past_7d * 0.95) + (discounts * 15) - (prices * 0.02) + np.random.normal(0, 2, n_samples)
    target_demand_7d = np.maximum(1, np.round(base_demand))

    X = np.column_stack([categories, prices, past_7d, past_14d, discounts, day_of_week])
    y = target_demand_7d

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.08, max_depth=4, random_state=42)
    model.fit(X_train_scaled, y_train)

    preds = model.predict(X_test_scaled)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    print(f"  -> Demand Model RMSE: {rmse:.3f}")

    joblib.dump({"model": model, "scaler": scaler}, os.path.join(MODELS_DIR, "demand_model.joblib"))
    print("  -> Saved demand_model.joblib")


def train_churn_model():
    print("[2/3] Training Customer Churn Early Warning Classifier...")
    np.random.seed(42)
    n_samples = 3000

    # Features:
    # 0: days_since_last_purchase (0 to 180)
    # 1: total_spent (20 to 3000)
    # 2: order_count (1 to 30)
    # 3: avg_order_value (15 to 300)
    # 4: ticket_count (0 to 8)
    # 5: negative_tickets (0 to 5)
    days_since_purchase = np.random.exponential(scale=35, size=n_samples)
    order_count = np.random.poisson(lam=4, size=n_samples) + 1
    avg_order_value = np.random.uniform(30, 200, n_samples)
    total_spent = order_count * avg_order_value
    ticket_count = np.random.poisson(lam=1.2, size=n_samples)
    negative_tickets = np.minimum(ticket_count, np.random.binomial(n=ticket_count, p=0.4))

    # Churn probability logic:
    # High recency (>60 days), high negative tickets, and low repeat rate -> churn
    z = (
        (days_since_purchase / 40.0) * 1.8
        + (negative_tickets * 1.6)
        - (order_count * 0.15)
        - (total_spent * 0.001)
        - 2.2
    )
    prob_churn = 1 / (1 + np.exp(-z))
    churn_labels = (prob_churn > 0.5).astype(int)

    X = np.column_stack([days_since_purchase, total_spent, order_count, avg_order_value, ticket_count, negative_tickets])
    y = churn_labels

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    clf = RandomForestClassifier(n_estimators=120, max_depth=6, random_state=42)
    clf.fit(X_train_scaled, y_train)

    acc = accuracy_score(y_test, clf.predict(X_test_scaled))
    print(f"  -> Churn Classifier Accuracy: {acc * 100:.2f}%")
    feature_names = ["days_since_last_purchase", "total_spent", "order_count", "avg_order_value", "ticket_count", "negative_tickets"]
    importances = dict(zip(feature_names, clf.feature_importances_))
    print(f"  -> Top Features: {importances}")

    joblib.dump({"model": clf, "scaler": scaler, "features": feature_names}, os.path.join(MODELS_DIR, "churn_model.joblib"))
    print("  -> Saved churn_model.joblib")


def train_return_model():
    print("[3/3] Training Product Return Risk Classifier...")
    np.random.seed(42)
    n_samples = 2500

    # Features:
    # 0: category_encoded (0=Electronics, 1=Apparel, 2=Footwear, 3=Home, 4=Beauty, 5=Accessories, 6=Sports)
    # 1: price (10 to 300)
    # 2: past_return_rate (0.5 to 15.0)
    # 3: channel_encoded (0=web, 1=mobile, 2=store)
    categories = np.random.randint(0, 7, n_samples)
    prices = np.random.uniform(15, 250, n_samples)
    # Apparel (1) and Footwear (2) naturally have higher historical return rates
    base_return_rate = np.where(np.isin(categories, [1, 2]), np.random.uniform(6.0, 14.0, n_samples), np.random.uniform(1.0, 5.0, n_samples))
    channel = np.random.randint(0, 3, n_samples)

    # Return propensity: web & mobile higher sizing return than store
    z_return = (base_return_rate * 0.28) + (prices * 0.005) - (channel * 0.3) - 2.0
    prob_return = 1 / (1 + np.exp(-z_return))
    return_labels = (prob_return > 0.4).astype(int)

    X = np.column_stack([categories, prices, base_return_rate, channel])
    y = return_labels

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    clf = GradientBoostingClassifier(n_estimators=100, max_depth=3, random_state=42)
    clf.fit(X_train_scaled, y_train)

    acc = accuracy_score(y_test, clf.predict(X_test_scaled))
    print(f"  -> Return Risk Model Accuracy: {acc * 100:.2f}%")

    joblib.dump(
        {"model": clf, "scaler": scaler, "features": ["category", "price", "base_return_rate", "channel"]},
        os.path.join(MODELS_DIR, "return_model.joblib"),
    )
    print("  -> Saved return_model.joblib")


if __name__ == "__main__":
    print("==================================================")
    print("Training RetailSync AI Machine Learning Models...")
    print("==================================================")
    train_demand_model()
    train_churn_model()
    train_return_model()
    print("All models successfully trained and serialized with Joblib!")
