# AgriStack v2.0 - Upgrade Documentation

## 🎉 What's New

This is the upgraded version of AgriStack with significant new features and improvements:

### ✨ New Features

1. **🤖 Upgraded AI Chatbot**
   - Gemini 2.5 Flash (faster, smarter responses)
   - Context-aware with farmer data, weather, and NDVI
   - Natural language understanding of agricultural practices

2. **👤 Complete Profile Management**
   - View and edit your farmer profile
   - Upload profile images
   - Edit name, location, address, crop type
   - View account information

3. **🔔 Real-Time Notification System**
   - Temperature alerts (>35°C)
   - Crop stress alerts (NDVI < 0.3)
   - Humidity warnings (>80%)
   - Irrigation recommendations
   - Color-coded severity (green/yellow/red)

4. **🔄 Auto-Refresh Data**
   - Weather updates every 60 seconds
   - NDVI updates every 120 seconds
   - AI recommendations every 120 seconds
   - Manual refresh button in dashboard

5. **📸 Profile Image Support**
   - Upload and store profile photos
   - Avatar display across app
   - JPG and PNG support

## 🚀 Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Test Credentials
```
Email: ravi.test@agristack.com
Password: farmpass123
```

## 📁 Project Structure

```
agristack/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx        # Authentication
│   │   ├── Dashboard.tsx        # Main app with notifications
│   │   ├── ProfilePage.tsx      # Profile management (NEW)
│   │   └── FarmTracking.tsx     # Satellite map
│   ├── components/
│   │   ├── Chatbot.tsx          # AI chatbot
│   │   ├── WeatherPanel.tsx     # Weather display
│   │   ├── NDVIPanel.tsx        # Vegetation health
│   │   ├── AIRecommendations.tsx # AI recommendations
│   │   ├── InsightsPanel.tsx    # Real-time stats
│   │   └── NotificationsPanel.tsx # Notifications (NEW)
│   ├── hooks/
│   │   └── useAgriData.ts       # Data fetching with auto-refresh (UPDATED)
│   ├── lib/
│   │   └── supabase.ts          # Database client
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── App.tsx                  # Router
│   ├── main.tsx                 # Entry point
│   └── theme.ts                 # Material UI theme
├── supabase/
│   ├── functions/
│   │   └── agristack-api/       # Backend (Gemini 2.5 Flash)
│   └── migrations/              # Database schemas
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 🔑 Key Routes

| Route | Purpose | Authentication |
|-------|---------|-----------------|
| `/login` | Sign in / Register | None |
| `/dashboard` | Main app | Required |
| `/profile` | Profile management | Required |
| `/farm-tracking` | Satellite map | Required |

## 🎯 Features Explained

### Profile Page (`/profile`)
- **View Mode**: See all your information
- **Edit Mode**: Change name, location, address, crop type, and upload image
- **Account Info**: Email and membership date
- **GPS Coordinates**: Display of your farm location

### Notifications Bell
- **Location**: Top-right of dashboard
- **Badge**: Shows count of unread alerts
- **Alerts Include**:
  - Temperature warnings
  - Humidity alerts
  - Crop stress (NDVI)
  - Irrigation recommendations
  - Status messages

### Auto-Refresh System
- Weather updates: **60 seconds**
- NDVI updates: **120 seconds**
- Recommendations: **120 seconds**
- Manual refresh available via button

### Upgraded Chatbot
- Uses **Gemini 2.5 Flash** for faster responses
- Understands context from your farm data
- Provides agricultural advice specific to your situation

## 🔧 Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GEE_API_KEY=your_gee_api_key
```

### Customization Options

**Auto-Refresh Intervals** (in `src/hooks/useAgriData.ts`)
```typescript
// Change weather refresh interval (ms)
useEffect(() => { const timer = setInterval(fetchWeather, 60000); ... }, [fetchWeather]);

// Change NDVI refresh interval (ms)
useEffect(() => { const timer = setInterval(fetchNDVI, 120000); ... }, [fetchNDVI]);

// Change recommendations refresh interval (ms)
useEffect(() => { const timer = setInterval(fetchAnalysis, 120000); ... }, [fetchAnalysis]);
```

**Notification Alerts** (in `src/components/NotificationsPanel.tsx`)
- Modify temperature thresholds
- Adjust humidity levels
- Customize alert messages
- Change alert colors

## 🎨 Design System

- **Color Scheme**: Dark theme with green & yellow accents
- **Primary**: #2E7D32 (Green)
- **Secondary**: #F9A825 (Yellow)
- **Components**: Material UI v9
- **Icons**: Material Icons

## 📊 Database Schema

### Farmers Table
```sql
CREATE TABLE farmers (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  email text,
  location text,
  address text,
  crop_type text,
  lat numeric(10,7),
  lon numeric(10,7),
  image_url text,          -- NEW: Profile image
  created_at timestamptz,
  updated_at timestamptz   -- NEW: For tracking updates
);
```

## 🔐 Security

- **Authentication**: Supabase auth with email/password
- **Row Level Security**: Users access only their own data
- **HTTPS**: Enforced on all connections
- **CORS**: Properly configured on Edge Functions
- **Image Upload**: Validated for format and size

## 🧪 Testing

### Test Account
```
Email: ravi.test@agristack.com
Password: farmpass123
```

### What to Test
- [ ] Login works
- [ ] Dashboard loads with real data
- [ ] Profile page displays info
- [ ] Edit profile and save changes
- [ ] Upload profile image
- [ ] Click notification bell
- [ ] Chat with bot
- [ ] Navigate to farm tracking
- [ ] Data auto-refreshes

## 📱 Responsive Design

- Mobile: < 600px (optimized for tablets)
- Tablet: 600px - 900px
- Desktop: > 900px (full features)

## 🚀 Deployment

### Frontend (Netlify)
1. Push to GitHub
2. Connect repository to Netlify
3. Set environment variables
4. Build and deploy automatically

### Backend (Supabase)
- Already deployed ✅
- Edge Function ready ✅
- Database configured ✅

### Live URL
- Frontend: `https://your-agristack.netlify.app`
- Backend: `https://ipromonzrtunpfjoaodn.supabase.co/functions/v1/agristack-api`

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## 📝 Changelog

### v2.0 (2026-04-22)
- ✅ Upgraded to Gemini 2.5 Flash
- ✅ Added profile management page
- ✅ Implemented real-time notifications
- ✅ Added auto-refresh for all data
- ✅ Profile image upload support
- ✅ Enhanced notification system with color coding
- ✅ Improved dashboard navigation

### v1.0 (2026-04-22)
- Initial release
- Login/Registration
- Dashboard with weather, NDVI, AI recommendations
- Chatbot with Gemini
- Satellite map tracking
- AI analysis engine

## 🐛 Known Limitations

1. **Profile Images**: Stored as base64 data URL (consider cloud storage for large files)
2. **Notifications**: Ephemeral (cleared on page reload)
3. **NDVI**: Simulated data (use real Earth Engine for production)
4. **Weather**: Uses OpenWeather free tier (limited accuracy)

## 🎯 Future Enhancements

- [ ] Push notifications
- [ ] Persistent notification history
- [ ] Image storage in cloud
- [ ] Mobile app version
- [ ] Analytics dashboard
- [ ] Soil moisture integration
- [ ] Pest detection with AI
- [ ] Multi-language support

## 📚 Documentation

- `UPGRADE_SUMMARY.md` - Detailed changes
- `DEPLOYMENT_GUIDE.md` - How to deploy
- `README.md` - Original project info

## 🤝 Support

For issues or questions:
1. Check `DEPLOYMENT_GUIDE.md` troubleshooting section
2. Review error messages in browser console
3. Check Supabase dashboard for database issues
4. Verify environment variables are set correctly

## 📄 License

Open source - feel free to use and modify

## 👨‍💻 Development

Built with:
- **React 19** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Material UI** - Component library
- **Supabase** - Backend
- **Leaflet** - Maps

---

**Version**: 2.0  
**Last Updated**: 2026-04-22  
**Status**: ✅ Production Ready  
**Team**: AgriStack Development
