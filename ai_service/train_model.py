import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle

# 1. Generate Synthetic Data (Simulating Leaf features)
# Features: [Green Ratio (0-1), Brown Spots (0-1), Yellowing (0-1)]
np.random.seed(42)
healthy_leaves = np.random.normal(loc=[0.85, 0.05, 0.05], scale=0.05, size=(500, 3))
diseased_leaves = np.random.normal(loc=[0.40, 0.45, 0.40], scale=0.10, size=(500, 3))

X = np.vstack((healthy_leaves, diseased_leaves))
y = np.array([0] * 500 + [1] * 500) # 0 = Healthy, 1 = Diseased

# 2. Train the Model
print("Training Random Forest model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# 3. Save the Model
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("Model trained successfully and saved as model.pkl!")