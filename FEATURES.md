# Features of Gemini PT Calculator

## Overview
This application is a **Gemini Cost Optimization Engine** designed to help users compare costs between **Pay-as-you-go (PayGo)** and **Provisioned Throughput (PT)** models for Vertex AI (Gemini) usage. It simulates traffic patterns and attempts to find the break-even point and optimal strategy.

## Key Features

### 1. Cost Comparison Engine
- **Pay-as-you-go Calculation**: Estimates annual PayGo costs based on input/output token volume derived from TPS and peak/off-peak usage.
- **Provisioned Throughput Calculation**: estimates annual PT costs based on calculated GSUs (GenAI Service Units) needed to handle peak load.
- **Recommendation System**: Automatically recommends the cheaper option ("Switch to Provisioned" or "Stay on Pay-as-you-go") and calculates potential annual savings.

### 2. Traffic Modeling (Workload Profile)
Users can configure a detailed traffic profile to simulate real-world usage:
- **Peak Traffic**: separate inputs for Peak Input TPS and Peak Output TPS.
- **Traffic Shape**:
    - **Peak Duration**: Configurable hours per day at max load (1-24h).
    - **Off-Peak Traffic**: Percentage of peak volume during off-peak hours (0-100%).
- **Advanced Constraints**:
    - **GSU Capacity**: Capacity per GSU unit (default 500).
    - **Burndown Rates**: Input/Output burndown ratios (used to convert TPS to "units" for GSU sizing).

### 3. Pricing Configuration
Fully customizable pricing parameters:
- **PayGo Rates**: Input and Output price per 1 million tokens.
- **PT Commit Rates**: Monthly and 1-Year commit prices per GSU.

### 4. Visualizations & Analytics
*Powered by Recharts*

- **24-Hour Traffic Simulator**:
    - Bar chart showing traffic distribution over a 24-hour day.
    - Line overlay showing "Paid Capacity" to visualize wasted resources (gap between capacity and actual usage).
    - Dynamic "Peak" vs "Off-Peak" coloring.
- **Break-Even Analysis Curve**:
    - Area chart plotting PayGo vs PT costs across 0-100% utilization.
    - Visualizes where the two pricing models coincide (the break-even point).
    - Shows the user's current estimated position on the curve.

### 5. Detailed Metrics
- **Hardware Sizing**: Calculates the number of GSUs required to handle the specified peak load.
- **Effective Utilization**: Calculates a weighted 24h average load percentage.
- **Cost Table**: A detailed breakdown table comparing:
    - Pay-as-you-go (Baseline)
    - Provisioned Throughput (Monthly Commit)
    - Provisioned Throughput (1-Year Commit)
    - Shows percentage increase or decrease relative to the baseline.

## specialized Components
- **MetricCard**: Reusable UI component for displaying key stats with icons and dynamic coloring.
- **Input Components**: Specialized inputs for Numbers cost (Input with "TPS" suffix), Currency (PriceInput), and Sliders (RangeControl).
- **Tooltips**: Custom chart tooltips (`DailyTooltip`, `BreakEvenTooltip`) providing deep context on hover (e.g., "Wasted Capacity %").

## Technical Stack
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (with `tailwindcss-animate` capabilities implied by dynamic classes)
- **Charts**: Recharts
- **Icons**: Lucide React
