# University of Computer Studies Pathein - Voting System

## 🎓 Complete Digital Voting Solution

A comprehensive, secure, and user-friendly digital voting system designed specifically for the University of Computer Studies Pathein. This system provides a complete solution for conducting elections, polls, and voting events within the university community.

## 🏗️ System Architecture

### Backend Components

- **RMI Server** (`rmi-server/`) - Core voting logic and database operations
- **API Bridge** (`api-bridge/`) - RESTful API layer using Spring Boot
- **Shared Module** (`shared/`) - Common data models and interfaces
- **Database** - MySQL with encrypted password storage

### Frontend Components

- **React UI** (`react-frontend/`) - Modern, responsive web interface
- **Admin Dashboard** - Event and candidate management
- **Voter Interface** - Secure voting experience
- **Real-time Results** - Live vote counting and visualization

## 🚀 Key Features

### 🔐 Security & Authentication

- **Encrypted Passwords** - AES-256 encryption for all user credentials
- **Secure Database** - MySQL with prepared statements preventing SQL injection
- **User Authentication** - Individual login credentials for each voter
- **Event Access Control** - Password-protected voting events

### 👨‍💼 Administrative Features

- **Event Creation** - Create voting events with unique IDs and passwords
- **Candidate Management** - Add candidates with photos and descriptions
- **User Account Generation** - Bulk creation of voter accounts with credentials
- **Account Distribution** - Print or download user credentials for distribution
- **Real-time Monitoring** - Live vote tracking and result visualization

### 🗳️ Voting Experience

- **Intuitive Interface** - Clean, user-friendly voting interface
- **Candidate Photos** - Visual candidate identification
- **Vote Confirmation** - Clear confirmation of cast votes
- **Mobile Responsive** - Works on all devices (desktop, tablet, mobile)
- **Accessibility** - Designed for users with varying technical skills

### 📊 Results & Analytics

- **Live Results** - Real-time vote counting and percentage calculations
- **Visual Charts** - Progress bars and ranking displays
- **Auto-refresh** - Automatic result updates every 5 seconds
- **Export Options** - Download results and account data

## 🛠️ Technology Stack

### Backend Technologies

- **Java 11+** - Core programming language
- **Spring Boot 2.7+** - Web framework and dependency injection
- **RMI (Remote Method Invocation)** - Distributed computing
- **MySQL 8.0** - Database management system
- **Maven** - Build and dependency management

### Frontend Technologies

- **React 19** - Modern JavaScript UI library
- **Vite** - Fast build tool and development server
- **Modern CSS** - Responsive design with CSS Grid and Flexbox
- **Fetch API** - HTTP client for backend communication

### Infrastructure

- **Docker** - Containerization for MySQL database
- **CORS** - Cross-origin resource sharing configuration
- **RESTful APIs** - Standard HTTP methods and JSON responses

## 📋 System Workflow

### 1. Event Setup (Administrator)

```
Create Event → Add Candidates → Generate User Accounts → Distribute Credentials
```

### 2. Voting Process (Students)

```
Login → Access Event → View Candidates → Cast Vote → Receive Confirmation
```

### 3. Results Monitoring (Administrator)

```
Monitor Live Results → View Analytics → Export Data
```

## 🎯 Use Cases

### Student Council Elections

- **Candidates**: Student council positions (President, Vice President, Secretary, etc.)
- **Voters**: All enrolled students
- **Features**: Candidate photos, manifestos, real-time results

### Faculty Surveys

- **Topics**: Course feedback, facility improvements, policy decisions
- **Voters**: Faculty members and staff
- **Features**: Anonymous voting, detailed analytics

### Department Polls

- **Decisions**: Event planning, resource allocation, schedule changes
- **Voters**: Department-specific groups
- **Features**: Quick setup, instant results

### University-wide Referendums

- **Issues**: Major policy changes, infrastructure decisions
- **Voters**: Entire university community
- **Features**: Large-scale account management, comprehensive reporting

## 🔧 Installation & Setup

### Prerequisites

- Java 11 or higher
- Node.js 16 or higher
- MySQL 8.0
- Maven 3.6+
- Docker (optional)

### Quick Start

1. **Database Setup**

   ```bash
   docker compose up mysql -d
   mysql -u root -p'root' < rmi-server/src/main/resources/init-database.sql
   ```

2. **Backend Services**

   ```bash
   # Start RMI Server
   cd rmi-server && mvn compile exec:java -Dexec.mainClass="Server"

   # Start API Bridge
   cd api-bridge && mvn spring-boot:run
   ```

3. **Frontend Application**

   ```bash
   cd react-frontend && npm install && npm run dev
   ```

4. **Access the System**
    - Frontend: http://localhost:5127
    - API: http://localhost:8080

## 🏆 Conclusion

The University of Computer Studies Pathein Voting System represents a modern, secure, and user-friendly solution for digital democracy within the university community. By combining robust backend security with an intuitive frontend interface, the system ensures both the integrity of the voting process and the accessibility of democratic participation.

This comprehensive solution not only serves the immediate needs of university elections but also provides a foundation for future enhancements and integrations, making it a valuable long-term investment in the university's digital infrastructure.

**University of Computer Studies Pathein**  
_Empowering Digital Democracy Through Technology_
