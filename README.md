brightpoints/
│
├── backend/
│ ├── app/
│ │ ├── main.py
│ │ ├── core/
│ │ │ ├── config.py
│ │ │ ├── security.py
│ │ │ └── database.py
│ │ │
│ │ ├── models/
│ │ │ └── my_model.py
│ │ │
│ │ ├── schemas/
│ │ │ ├── user.py
│ │ │ ├── house.py
│ │ │ └── points.py
│ │ │
│ │ ├── api/
│ │ │ ├── deps.py
│ │ │ └── routes/
│ │ │ ├── auth.py
│ │ │ ├── houses.py
│ │ │ └── points.py
│ │ │
│ │ └── services/
│ │ └── points_service.py
│ │
│ ├── requirements.txt
│ └── .env
│
├── frontend/
│ ├── src/
│ │ ├── api/
│ │ │ └── client.ts
│ │ ├── components/
│ │ │ ├── PointsLog.tsx
│ │ │ ├── HouseCard.tsx
│ │ │ ├── AddPointsModal.tsx
│ │ │ └── CreateHouseModal.tsx
│ │ ├── pages/
│ │ │ ├── Dashboard.tsx
│ │ │ ├── TeacherView.tsx
│ │ │ └── StudentView.tsx
│ │ ├── App.tsx
│ │ ├── main.tsx
│ │ └── styles.css
│ │
│ ├── package.json
│ └── vite.config.ts
│
└── docker-compose.yml
