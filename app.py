import streamlit as st
import pandas as pd
from datetime import date, timedelta

st.title("📊 אפליקציית ניהול הוצאות")

# טבלת נתונים (במקום אקסל בהתחלה)
if "data" not in st.session_state:
    st.session_state["data"] = pd.DataFrame(columns=["תאריך", "קטגוריה", "סכום"])

# טופס להוספת הוצאה
with st.form("add_expense"):
    category = st.text_input("קטגוריה (לדוגמה: אוכל, דלק, בילויים)")
    amount = st.number_input("סכום (₪)", min_value=0.0, step=1.0)
    submitted = st.form_submit_button("הוסף הוצאה")
    if submitted and category and amount > 0:
        new_row = pd.DataFrame({"תאריך": [date.today()],
                                "קטגוריה": [category],
                                "סכום": [amount]})
        st.session_state["data"] = pd.concat([st.session_state["data"], new_row], ignore_index=True)
        st.success("✅ ההוצאה נוספה!")

# מציג את כל ההוצאות
st.subheader("📅 כל ההוצאות")
st.dataframe(st.session_state["data"])

# סכום חודשי
if not st.session_state["data"].empty:
    total = st.session_state["data"]["סכום"].sum()
    st.metric("סה״כ הוצאות עד עכשיו", f"{total:,.0f} ₪")
    
    # חישוב יומי עד סוף החודש
    today = date.today()
    last_day = date(today.year, today.month + 1, 1) - timedelta(days=1) if today.month < 12 else date(today.year, 12, 31)
    days_left = (last_day - today).days + 1
    avg_per_day = total / days_left if days_left > 0 else total
    st.metric("ממוצע ליום עד סוף החודש", f"{avg_per_day:,.0f} ₪")
