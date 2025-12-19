# LeetCode Premium Sorter

A simple offline web app to browse and filter LeetCode problems by company, topic, and difficulty.

## Setup

1.  Install dependencies:
    ```bash
    cd web-app
    npm install
    ```

2.  Generate data (if repo data changes):
    ```bash
    node scripts/generate-data.js
    ```
    This script reads from `../repo/leetcode-company-wise-problems` and updates `public/data.json`.

3.  Run the app:
    ```bash
    npm run dev
    ```

## Features
- Filter by Company, Topic, Difficulty
- Multi-selection support
- Sort by Frequency, Difficulty, Acceptance Rate
- Responsive Table View
