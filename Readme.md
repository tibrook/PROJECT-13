# Proof of Concept (POC) - Chat en Temps Réel

## Description

Ce projet est un **Proof of Concept (POC)** d'une application de chat en temps réel. L'application permet à plusieurs utilisateurs de se connecter et d'envoyer des messages à travers une interface Web. Le projet est conçu en deux parties distinctes :

1. **Backend** : Un serveur basé sur **Spring Boot** qui gère les connexions WebSocket et la logique de communication en temps réel.
2. **Frontend** : Une application **Angular** qui permet aux utilisateurs d'envoyer et de recevoir des messages via une interface utilisateur.

Ce POC démontre comment implémenter un service de chat avec **WebSocket** et **STOMP** en utilisant **Spring Boot** pour le backend et **Angular** pour le frontend.

---

## Prérequis

- **Java 17** ou supérieur (pour le backend Spring Boot)
- **Node.js** et **npm** (pour le frontend Angular)
- **Maven** (pour gérer les dépendances du backend)
- **Git** (pour cloner le projet)

---

## Installation

### 1. Installer la BDD

Installer la base de données (MySQL avec le script suivant :)
```
-- Create the database
CREATE DATABASE YourCarYourWay;
USE YourCarYourWay;

-- Table for users (generic, including both customers and employees)
CREATE TABLE Users (
    user_id UUID PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    birth_date DATE,
    address VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'customer', -- Either 'customer' or 'employee'
    employee_id UUID,
    customer_id UUID,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

-- Table for customers (inherits from Users)
CREATE TABLE Customers (
    customer_id UUID PRIMARY KEY,
    user_id UUID,
    address VARCHAR(255),
    birth_date DATE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Table for employees (inherits from Users)
CREATE TABLE Employees (
    employee_id UUID PRIMARY KEY,
    user_id UUID,
    position VARCHAR(255),
    agency_id UUID, -- Foreign key linking to the agency table
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Table for user preferences
CREATE TABLE Preferences (
    preference_id UUID PRIMARY KEY,
    user_id UUID,
    email_preference BOOLEAN DEFAULT TRUE,
    sms_preference BOOLEAN DEFAULT TRUE,
    push_preference BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    time_zone VARCHAR(50) DEFAULT 'UTC',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Table for agencies
CREATE TABLE Agencies (
    agency_id UUID PRIMARY KEY,
    agency_name VARCHAR(255),
    address VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    opening_hours VARCHAR(50),
    closing_hours VARCHAR(50)
);

-- Table for vehicles
CREATE TABLE Vehicles (
    vehicle_id UUID PRIMARY KEY,
    make VARCHAR(255),
    model VARCHAR(255),
    year INT,
    category VARCHAR(50), -- ACRISS category
    transmission_type VARCHAR(50),
    fuel_type VARCHAR(50),
    mileage INT,
    daily_price DECIMAL(10, 2),
    agency_id UUID, -- Foreign key linking to the agency where the vehicle is located
    status VARCHAR(50) DEFAULT 'available',
    FOREIGN KEY (agency_id) REFERENCES Agencies(agency_id) ON DELETE SET NULL
);

-- Table for car reservations
CREATE TABLE Reservations (
    reservation_id UUID PRIMARY KEY,
    user_id UUID,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    vehicle_id UUID,
    start_agency_id UUID,
    return_agency_id UUID,
    price DECIMAL(10, 2) NOT NULL,
    reservation_status VARCHAR(50) DEFAULT 'ongoing',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(vehicle_id) ON DELETE SET NULL,
    FOREIGN KEY (start_agency_id) REFERENCES Agencies(agency_id) ON DELETE SET NULL,
    FOREIGN KEY (return_agency_id) REFERENCES Agencies(agency_id) ON DELETE SET NULL
);

-- Table for payments
CREATE TABLE Payments (
    payment_id UUID PRIMARY KEY,
    reservation_id UUID,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(50) DEFAULT 'confirmed',
    FOREIGN KEY (reservation_id) REFERENCES Reservations(reservation_id) ON DELETE CASCADE
);

-- Table for rental offers
CREATE TABLE RentalOffers (
    offer_id UUID PRIMARY KEY,
    vehicle_id UUID,
    start_agency_id UUID,
    return_agency_id UUID,
    availability_date TIMESTAMP NOT NULL,
    vehicle_category VARCHAR(50),
    daily_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(vehicle_id) ON DELETE SET NULL,
    FOREIGN KEY (start_agency_id) REFERENCES Agencies(agency_id) ON DELETE SET NULL,
    FOREIGN KEY (return_agency_id) REFERENCES Agencies(agency_id) ON DELETE SET NULL
);

-- Table for chat sessions
CREATE TABLE Chat (
    chat_id UUID PRIMARY KEY,
    user_id UUID,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'open',
    ticket_support_id UUID, -- Optional link to a support ticket if applicable
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Table for chat messages
CREATE TABLE ChatMessages (
    message_id UUID PRIMARY KEY,
    chat_id UUID,
    sender_id UUID,
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES Chat(chat_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Table for notifications
CREATE TABLE Notifications (
    notification_id UUID PRIMARY KEY,
    user_id UUID,
    notification_type VARCHAR(50) NOT NULL,
    message TEXT,
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notification_status VARCHAR(50) DEFAULT 'unread',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Table for authentication data
CREATE TABLE Authentication (
    auth_id UUID PRIMARY KEY,
    user_id UUID,
    password_hash VARCHAR(255) NOT NULL,
    auth_token TEXT,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_mfa TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Table for sessions
CREATE TABLE Sessions (
    session_id UUID PRIMARY KEY,
    user_id UUID,
    session_token TEXT,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
```

### 1. Cloner le projet

Clonez le dépôt du projet dans deux répertoires distincts pour le frontend et le backend.

```
git clone https://github.com/tibrook/OCP13
```
### 2. Configuration du Backend (Spring Boot)
 
- Se rendre à l'URL du dépot cloné /demo
- Installez les dépendances Maven pour le backend :

```
mvn clean install
```

### 3. Démarrer le backend
Une fois les dépendances installées, vous pouvez lancer le backend avec la commande suivante :

```
mvn spring-boot:run
```
Le backend sera accessible par défaut sur http://127.0.0.1:8081.

3. Configuration du Frontend (Angular)d 

- Se rendre sur l'URL du dépot, /chat-app

a. Installer les dépendances
Exécutez la commande suivante pour installer les dépendances nécessaires à l'application Angular :

```
npm install
```

c. Lancer le frontend
Une fois les dépendances installées, démarrez le serveur de développement Angular avec la commande suivante :

```
npm start
```
Le frontend sera accessible par défaut sur http://localhost:4200.



## Développement et amélioration


Ce POC est un point de départ pour développer une application de chat plus complète. Vous pouvez ajouter des fonctionnalités supplémentaires telles que :
