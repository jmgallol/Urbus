# Database Directory

This folder contains all database-related files and configurations for the Traccar Server project.

## Contents

### Configuration Files
- **traccar.xml** - Main Traccar configuration file with database connection settings
- **debug.xml** - Debug configuration for development and testing

### Schema & Migrations
- **schema/** - Contains Liquibase changelog XML files for database schema version management
  - `changelog-master.xml` - Master changelog that includes all other changelogs
  - `changelog-*.xml` - Individual version changelogs

### Database Data
- **data/** - Contains the actual H2 database files when using the default H2 database

### Utility Scripts
- **CheckDatabase.java** - Database validation utility
- **CheckDB.java** - Database checking tool
- **CheckMig.java** - Database migration checker
- **CheckUsers.java** - User validation utility
- **CreateCheckpointTables.java** - Checkpoint table creation utility
- **Final.java** - Final database setup utility
- **FinalCheckDB.java** - Final database validation
- **ListTables.java** - Lists database tables
- **QueryDB.java** - Database query utility
- **TestCheckpoints.java** - Checkpoint testing utility
- **VerifyCheckpointTables.java** - Verifies checkpoint table integrity

## Usage

To compile and run the utility scripts:
```bash
javac -cp lib/* CheckDatabase.java
java -cp lib/* CheckDatabase
```

To access the configuration files:
- Development: Use `database/traccar.xml`
- Debug mode: Use `database/debug.xml`

## Database URL Configuration

The database URL is configured in the XML files as:
- **Development**: `jdbc:h2:C:/Users/juanm/Documents/Traccat-Server/database/data/database`
- **Relative**: `jdbc:h2:./database/data/database`

Note: For Windows, use forward slashes or escape backslashes in JDBC URLs.
