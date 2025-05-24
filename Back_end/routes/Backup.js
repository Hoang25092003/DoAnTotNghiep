const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { authenticateToken } = require('../middleware/auth');
const sql = require('mssql');

// Thư mục backup
const BACKUP_DIR = path.join(__dirname, '../backup');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

// Lưu cấu hình backup tự động 
router.post('/auto_backup', authenticateToken, (req, res) => {
    const { auto, interval, destination } = req.body;
    fs.writeFileSync(path.join(BACKUP_DIR, 'auto_backup_config.json'), JSON.stringify({ auto, interval, destination }));
    res.json({ success: true });
});

// Backup thủ công về máy
router.get('/backup', authenticateToken, async (req, res) => {
    try {
        const pool = getPool();
        const tables = [
            'User', 'Supplier', 'Warehouse', 'Category', 'Products', 'Inventory',
            'Import', 'Import_Detail', 'Export', 'Export_Detail', 'Report',
            'Devices', 'DevicesAuthorization'
        ];
        const backupData = {};
        for (const table of tables) {
            const result = await pool.request().query(`SELECT * FROM [${table}]`);
            backupData[table] = result.recordset;
        }
        res.json(backupData);
    } catch (err) {
        console.error('Error connecting to database:', err);
        return res.status(500).json({ error: 'Backup failed' });
    }

});

// Backup thủ công lên Google Drive (giả lập)
router.post('/backup_to_drive', authenticateToken, async (req, res) => {
    try {

        const pool = getPool();
        const result = await pool.request()
            .query('SELECT * FROM YourTable');

        // up load file lên Google Drive
        const filename = `backup_${Date.now()}.json`;
        const filePath = path.join(BACKUP_DIR, filename);
        fs.writeFileSync(filePath, JSON.stringify(result.recordset, null, 2), 'utf8');
        // Giả lập upload lên Google Drive
        const driveFilePath = path.join(BACKUP_DIR, 'drive', filename);
        if (!fs.existsSync(path.join(BACKUP_DIR, 'drive'))) fs.mkdirSync(path.join(BACKUP_DIR, 'drive'));
        fs.copyFileSync(filePath, driveFilePath);
        fs.unlinkSync(filePath); // Xóa file local sau khi upload
        res.json({ success: true, fileName: filename });

    } catch (err) {
        console.error('Error connecting to database:', err);
        return res.status(500).json({ error: 'Backup failed' });
    }
});

// Khôi phục từ file upload
router.post('/restore_backup', authenticateToken, upload.single('backupFile'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
        const jsonData = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
        const pool = getPool();
        // Lấy danh sách bảng từ file backup (tự động, không hardcode)
        const tables = Object.keys(jsonData);
        // isdo = 1 để đánh dấu là đang khôi phục dữ liệu
        await pool.request().query(`EXEC sp_set_session_context @key = N'is_undo', @value = 1`);
        // Xóa dữ liệu cũ (theo thứ tự ngược lại để tránh lỗi khóa ngoại)
        for (const table of tables.slice().reverse()) {
            await pool.request().query(`DELETE FROM [${table}]`);
        }

        // Chèn dữ liệu mới
        for (const table of tables) {
            const data = jsonData[table];
            if (data && data.length > 0) {
                for (const row of data) {
                    const keys = Object.keys(row);
                    if (keys.length === 0) continue;
                    const columns = keys.map(k => `[${k}]`).join(',');
                    const values = keys.map((k, idx) => `@v${idx}`).join(',');
                    const request = pool.request();
                    keys.forEach((k, idx) => request.input(`v${idx}`, row[k]));
                    // log câu lệnh SQL
                    // console.log(`INSERT INTO [${table}] (${columns}) VALUES (${values})`);
                    await request.query(`INSERT INTO [${table}] (${columns}) VALUES (${values})`);
                }
            }
        }
        fs.unlinkSync(req.file.path);
        res.json({ success: true });
    } catch (err) {
        console.error('Error restoring backup:', err);
        return res.status(500).json({ error: 'Restore failed' });
    }
});

// Khôi phục từ Google Drive (giả lập)
router.post('/restore_from_drive', authenticateToken, (req, res) => {
    const { fileName } = req.body;
    const filePath = path.join(BACKUP_DIR, fileName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

    try {
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const pool = getPool();
        //Xóa dữ liệu cũ
        pool.request().query('DELETE FROM YourTable', (err, result) => {
            if (err) {
                console.error('Error deleting old data:', err);
                return res.status(500).json({ error: 'Restore failed' });
            }
            // Chèn dữ liệu mới
            const insertPromises = jsonData.map(item => {
                return pool.request()
                    .input('column1', sql.VarChar, item.column1)
                    .input('column2', sql.Int, item.column2)
                    .query('INSERT INTO YourTable (column1, column2) VALUES (@column1, @column2)');
            });
            Promise.all(insertPromises)
                .then(() => {
                    res.json({ success: true });
                })
                .catch(err => {
                    console.error('Error inserting data:', err);
                    res.status(500).json({ error: 'Restore failed' });
                });
        });
    } catch (err) {
        console.error('Error restoring backup:', err);
        return res.status(500).json({ error: 'Restore failed' });
    }
});

//Lưu thao tác backup và restore vào ActionLog
router.post('/save_action_log', authenticateToken, async (req, res) => {
    const { userId, action_type, fileName, action_time, description } = req.body;
    try {
        const pool = getPool();
        await pool.request()
            .input('user_id', userId)
            .input('action_type', action_type)
            .input('action_time', action_time)
            .input('description', description)
            .input('new_data', fileName) 
            .input('is_undo', 0) 
            .query(`INSERT INTO ActionLog (user_id, action_type, action_time, new_data, description, is_undo) 
                    VALUES (@user_id, @action_type, @action_time, @new_data, @description, @is_undo)`);
        res.json({ success: true });
        // Log action
        console.log(`Action logged: ${action_type} by user ${userId} at ${action_time}`);
    } catch (err) {
        console.error('Error logging backup action:', err);
        return res.status(500).json({ error: 'Logging failed' });
    }
});

module.exports = router;