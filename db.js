// IndexedDB 数据存储管理器
class ReaderDataStore {
    constructor() {
        this.dbName = 'ReaderDB';
        this.dbVersion = 11; // 增加版本号
        this.db = null;
    }

    // 初始化数据库
    async init() {
        if (this.db) {
            console.log('数据库已连接');
            return this.db;
        }
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('数据库打开失败:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('数据库连接成功，版本:', this.dbVersion);
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 创建设置存储
                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
                    settingsStore.createIndex('key', 'key', { unique: true });
                }

                // 创建标记存储
                if (!db.objectStoreNames.contains('marks')) {
                    const marksStore = db.createObjectStore('marks', { keyPath: 'id', autoIncrement: true });
                    marksStore.createIndex('word', 'word', { unique: false });
                    marksStore.createIndex('groupId', 'groupId', { unique: false });
                }

                // 创建标记组存储
                if (!db.objectStoreNames.contains('markGroups')) {
                    const groupsStore = db.createObjectStore('markGroups', { keyPath: 'id', autoIncrement: true });
                    groupsStore.createIndex('name', 'name', { unique: false });
                }

                // 创建书籍存储
                if (!db.objectStoreNames.contains('books')) {
                    const booksStore = db.createObjectStore('books', { keyPath: 'name' });
                    booksStore.createIndex('name', 'name', { unique: true });
                    booksStore.createIndex('lastRead', 'lastRead', { unique: false });
                }

                // 创建书签存储
                if (!db.objectStoreNames.contains('bookmarks')) {
                    const bookmarksStore = db.createObjectStore('bookmarks', { keyPath: 'id', autoIncrement: true });
                    bookmarksStore.createIndex('bookName', 'bookName', { unique: false });
                    bookmarksStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                console.log('数据库结构创建完成');
            };
        });
    }

    // 获取设置
    async getSetting(key, defaultValue = null) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : defaultValue);
            };

            request.onerror = () => {
                console.error('获取设置失败:', request.error);
                resolve(defaultValue);
            };
        });
    }

    // 保存设置
    async setSetting(key, value) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value });

            request.onsuccess = () => {
                console.log('设置保存成功:', key, value);
                resolve();
            };

            request.onerror = () => {
                console.error('保存设置失败:', request.error);
                reject(request.error);
            };
        });
    }

    // 获取所有设置
    async getAllSettings() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.getAll();

            request.onsuccess = () => {
                const settings = {};
                request.result.forEach(item => {
                    settings[item.key] = item.value;
                });
                resolve(settings);
            };

            request.onerror = () => {
                console.error('获取所有设置失败:', request.error);
                resolve({});
            };
        });
    }

    // 添加标记
    async addMark(word, note = '', imageData = null, groupId = null) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['marks'], 'readwrite');
            const store = transaction.objectStore('marks');
            const mark = {
                word,
                note,
                imageData,
                groupId,
                timestamp: Date.now()
            };
            const request = store.add(mark);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('添加标记失败:', request.error);
                reject(request.error);
            };
        });
    }

    // 获取所有标记
    async getAllMarks() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['marks'], 'readonly');
            const store = transaction.objectStore('marks');
            const request = store.getAll();

            request.onsuccess = () => {
                console.log('获取标记成功，数量:', request.result?.length || 0);
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('获取标记失败:', request.error);
                resolve([]);
            };
        });
    }

    // 删除标记
    async deleteMark(id) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['marks'], 'readwrite');
            const store = transaction.objectStore('marks');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                console.error('删除标记失败:', request.error);
                reject(request.error);
            };
        });
    }

    // 添加标记组
    async addMarkGroup(name, words = []) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['markGroups'], 'readwrite');
            const store = transaction.objectStore('markGroups');
            const group = {
                name,
                words,
                timestamp: Date.now()
            };
            const request = store.add(group);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('添加标记组失败:', request.error);
                reject(request.error);
            };
        });
    }

    // 获取所有标记组
    async getAllMarkGroups() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['markGroups'], 'readonly');
            const store = transaction.objectStore('markGroups');
            const request = store.getAll();

            request.onsuccess = () => {
                console.log('获取标记组成功，数量:', request.result?.length || 0);
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('获取标记组失败:', request.error);
                resolve([]);
            };
        });
    }

    // 更新标记组
    async updateMarkGroup(id, data) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['markGroups'], 'readwrite');
            const store = transaction.objectStore('markGroups');
            const request = store.get(id);

            request.onsuccess = () => {
                const group = request.result;
                if (group) {
                    const updatedGroup = { ...group, ...data };
                    const updateRequest = store.put(updatedGroup);
                    
                    updateRequest.onsuccess = () => {
                        resolve();
                    };
                    
                    updateRequest.onerror = () => {
                        console.error('更新标记组失败:', updateRequest.error);
                        reject(updateRequest.error);
                    };
                } else {
                    reject(new Error('标记组不存在'));
                }
            };

            request.onerror = () => {
                console.error('获取标记组失败:', request.error);
                reject(request.error);
            };
        });
    }

    // 删除标记组
    async deleteMarkGroup(id) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['markGroups'], 'readwrite');
            const store = transaction.objectStore('markGroups');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                console.error('删除标记组失败:', request.error);
                reject(request.error);
            };
        });
    }











    // 计算文件哈希值
    async calculateFileHash(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    // 使用简单的哈希算法
                    const arrayBuffer = e.target.result;
                    const uint8Array = new Uint8Array(arrayBuffer);
                    let hash = 0;
                    
                    // 简单的哈希计算（为了性能，只取部分数据）
                    const step = Math.max(1, Math.floor(uint8Array.length / 1000));
                    for (let i = 0; i < uint8Array.length; i += step) {
                        hash = ((hash << 5) - hash) + uint8Array[i];
                        hash = hash & hash; // 转换为32位整数
                    }
                    
                    // 结合文件大小和修改时间
                    const combinedHash = `${hash}_${file.size}_${file.lastModified}`;
                    resolve(combinedHash);
                } catch (error) {
                    console.error('计算文件哈希失败:', error);
                    // 降级到文件名
                    resolve(file.name);
                }
            };
            
            reader.onerror = () => {
                console.error('读取文件失败:', reader.error);
                // 降级到文件名
                resolve(file.name);
            };
            
            reader.readAsArrayBuffer(file);
        });
    }

    // 保存书籍
    async saveBook(bookFile) {
        if (!this.db) await this.init();
        
        return new Promise(async (resolve, reject) => {
            try {
                // 计算文件哈希作为唯一标识
                const fileHash = await this.calculateFileHash(bookFile);
                console.log('计算文件哈希:', fileHash);
                
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const transaction = this.db.transaction(['books'], 'readwrite');
                        const store = transaction.objectStore('books');
                        
                        // 使用哈希值检查是否已存在相同书籍
                        const getRequest = store.get(fileHash);
                        
                        getRequest.onsuccess = () => {
                            const existingBook = getRequest.result;
                            
                            if (existingBook) {
                                // 如果书籍已存在，更新最后阅读时间和文件名
                                console.log('书籍已存在，更新阅读时间:', bookFile.name);
                                existingBook.lastRead = Date.now();
                                existingBook.lastModified = bookFile.lastModified;
                                existingBook.name = bookFile.name; // 更新显示名称
                                
                                const updateRequest = store.put(existingBook);
                                updateRequest.onsuccess = () => {
                                    console.log('书籍阅读时间更新成功:', bookFile.name);
                                    resolve(fileHash); // 返回哈希值
                                };
                                updateRequest.onerror = () => {
                                    console.error('更新书籍失败:', updateRequest.error);
                                    reject(updateRequest.error);
                                };
                            } else {
                                // 如果书籍不存在，创建新记录
                                const bookData = {
                                    id: fileHash, // 使用哈希作为主键
                                    name: bookFile.name,
                                    size: bookFile.size,
                                    lastModified: bookFile.lastModified,
                                    lastRead: Date.now(),
                                    fileData: e.target.result // 直接存储ArrayBuffer
                                };
                                
                                console.log('保存新书籍数据:', {
                                    id: bookData.id,
                                    name: bookData.name,
                                    size: bookData.size,
                                    dataSize: bookData.fileData ? bookData.fileData.byteLength : 0
                                });
                                
                                const putRequest = store.put(bookData);
                                
                                putRequest.onsuccess = () => {
                                    console.log('书籍保存成功:', bookFile.name);
                                    resolve(fileHash); // 返回哈希值
                                };
                                
                                putRequest.onerror = () => {
                                    console.error('保存书籍失败:', putRequest.error);
                                    reject(putRequest.error);
                                };
                            }
                        };
                        
                        getRequest.onerror = () => {
                            console.error('检查书籍失败:', getRequest.error);
                            reject(getRequest.error);
                        };
                    } catch (error) {
                        console.error('保存书籍失败:', error);
                        reject(error);
                    }
                };
                
                reader.onerror = () => {
                    console.error('读取书籍文件失败:', reader.error);
                    reject(reader.error);
                };
                
                reader.readAsArrayBuffer(bookFile); // 改为ArrayBuffer
            } catch (error) {
                console.error('计算文件哈希失败:', error);
                reject(error);
            }
        });
    }

    // 获取书籍
    async getBook(bookName) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['books'], 'readonly');
            const store = transaction.objectStore('books');
            const request = store.get(bookName);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('获取书籍失败:', request.error);
                reject(request.error);
            };
        });
    }



    // 获取最近阅读的书籍
    async getLastReadBook() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['books'], 'readonly');
            const store = transaction.objectStore('books');
            
            try {
                // 检查索引是否存在
                if (store.indexNames.contains('lastRead')) {
                    const index = store.index('lastRead');
                    const request = index.openCursor(null, 'prev');

                    request.onsuccess = () => {
                        const cursor = request.result;
                        if (cursor) {
                            resolve(cursor.value);
                        } else {
                            resolve(null);
                        }
                    };

                    request.onerror = () => {
                        console.error('获取最近阅读书籍失败:', request.error);
                        reject(request.error);
                    };
                } else {
                    // 如果索引不存在，使用备用方法
                    console.log('lastRead索引不存在，使用备用方法');
                    const request = store.getAll();

                    request.onsuccess = () => {
                        const books = request.result;
                        if (books && books.length > 0) {
                            // 按lastRead时间排序，返回最新的
                            books.sort((a, b) => (b.lastRead || 0) - (a.lastRead || 0));
                            resolve(books[0]);
                        } else {
                            resolve(null);
                        }
                    };

                    request.onerror = () => {
                        console.error('获取书籍列表失败:', request.error);
                        reject(request.error);
                    };
                }
            } catch (error) {
                console.error('获取最近阅读书籍失败:', error);
                reject(error);
            }
        });
    }

    // 更新书籍最后阅读时间
    async updateBookLastRead(bookName) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['books'], 'readwrite');
            const store = transaction.objectStore('books');
            const getRequest = store.get(bookName);

            getRequest.onsuccess = () => {
                const bookData = getRequest.result;
                if (bookData) {
                    bookData.lastRead = Date.now();
                    
                    // 如果存在旧的数据结构，尝试迁移
                    if (bookData.data && !bookData.fileData) {
                        try {
                            console.log('迁移旧数据结构:', bookName);
                            // 从Base64 Data URL转换为ArrayBuffer
                            const base64Data = bookData.data.replace('data:application/epub+zip;base64,', '');
                            const binaryString = atob(base64Data);
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                            }
                            bookData.fileData = bytes.buffer;
                            delete bookData.data; // 删除旧字段
                            console.log('数据结构迁移完成');
                        } catch (error) {
                            console.error('数据结构迁移失败:', error);
                        }
                    }
                    
                    const putRequest = store.put(bookData);
                    
                    putRequest.onsuccess = () => {
                        console.log('更新书籍阅读时间成功:', bookName);
                        resolve();
                    };
                    
                    putRequest.onerror = () => {
                        console.error('更新书籍阅读时间失败:', putRequest.error);
                        reject(putRequest.error);
                    };
                } else {
                    resolve();
                }
            };

            getRequest.onerror = () => {
                console.error('获取书籍失败:', getRequest.error);
                reject(getRequest.error);
            };
        });
    }

    // 删除书籍
    async deleteBook(bookName) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['books'], 'readwrite');
            const store = transaction.objectStore('books');
            const request = store.delete(bookName);

            request.onsuccess = () => {
                console.log('书籍删除成功:', bookName);
                resolve();
            };

            request.onerror = () => {
                console.error('删除书籍失败:', request.error);
                reject(request.error);
            };
        });
    }

    // 添加书签（覆盖模式，每本书只保留一个）
    async addBookmark(bookName, cfi, title = '', note = '') {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bookmarks'], 'readwrite');
            const store = transaction.objectStore('bookmarks');
            
            // 先删除该书籍的现有书签
            const index = store.index('bookName');
            const deleteRequest = index.getAllKeys(bookName);
            
            deleteRequest.onsuccess = () => {
                // 删除所有现有书签
                const deletePromises = deleteRequest.result.map(key => {
                    return new Promise((resolveDelete) => {
                        const deleteReq = store.delete(key);
                        deleteReq.onsuccess = () => resolveDelete();
                        deleteReq.onerror = () => resolveDelete();
                    });
                });
                
                Promise.all(deletePromises).then(() => {
                    // 添加新书签
                    const bookmark = {
                        bookName,
                        cfi,
                        title,
                        note,
                        timestamp: Date.now()
                    };
                    const addRequest = store.add(bookmark);

                    addRequest.onsuccess = () => {
                        console.log('书签添加成功:', title);
                        resolve(addRequest.result);
                    };

                    addRequest.onerror = () => {
                        console.error('添加书签失败:', addRequest.error);
                        reject(addRequest.error);
                    };
                });
            };

            deleteRequest.onerror = () => {
                console.error('删除旧书签失败:', deleteRequest.error);
                reject(deleteRequest.error);
            };
        });
    }

    // 获取书籍的书签（每本书只有一个）
    async getBookmarks(bookName) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bookmarks'], 'readonly');
            const store = transaction.objectStore('bookmarks');
            const index = store.index('bookName');
            const request = index.getAll(bookName);

            request.onsuccess = () => {
                // 每本书只有一个书签，直接返回
                const bookmarks = request.result;
                resolve(bookmarks);
            };

            request.onerror = () => {
                console.error('获取书签失败:', request.error);
                resolve([]);
            };
        });
    }

    // 删除书签
    async deleteBookmark(id) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bookmarks'], 'readwrite');
            const store = transaction.objectStore('bookmarks');
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('书签删除成功');
                resolve();
            };

            request.onerror = () => {
                console.error('删除书签失败:', request.error);
                reject(request.error);
            };
        });
    }

    // 更新书签
    async updateBookmark(id, data) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bookmarks'], 'readwrite');
            const store = transaction.objectStore('bookmarks');
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const bookmark = getRequest.result;
                if (bookmark) {
                    const updatedBookmark = { ...bookmark, ...data };
                    const putRequest = store.put(updatedBookmark);
                    
                    putRequest.onsuccess = () => {
                        console.log('书签更新成功');
                        resolve();
                    };
                    
                    putRequest.onerror = () => {
                        console.error('更新书签失败:', putRequest.error);
                        reject(putRequest.error);
                    };
                } else {
                    reject(new Error('书签不存在'));
                }
            };

            getRequest.onerror = () => {
                console.error('获取书签失败:', getRequest.error);
                reject(getRequest.error);
            };
        });
    }


    // 清空所有数据
    async clearAll() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings', 'marks', 'markGroups', 'books', 'bookmarks'], 'readwrite');
            
            const settingsStore = transaction.objectStore('settings');
            const marksStore = transaction.objectStore('marks');
            const groupsStore = transaction.objectStore('markGroups');
            const booksStore = transaction.objectStore('books');
            const bookmarksStore = transaction.objectStore('bookmarks');

            Promise.all([
                new Promise((res, rej) => {
                    const request = settingsStore.clear();
                    request.onsuccess = res;
                    request.onerror = rej;
                }),
                new Promise((res, rej) => {
                    const request = marksStore.clear();
                    request.onsuccess = res;
                    request.onerror = rej;
                }),
                new Promise((res, rej) => {
                    const request = groupsStore.clear();
                    request.onsuccess = res;
                    request.onerror = rej;
                }),
                new Promise((res, rej) => {
                    const request = booksStore.clear();
                    request.onsuccess = res;
                    request.onerror = rej;
                }),
                new Promise((res, rej) => {
                    const request = bookmarksStore.clear();
                    request.onsuccess = res;
                    request.onerror = rej;
                })
            ]).then(() => {
                console.log('所有数据已清空');
                resolve();
            }).catch(reject);
        });
    }


}

// 创建全局实例
const dataStore = new ReaderDataStore();

// 添加测试方法到全局
window.testDatabase = async function() {
    try {
        console.log('=== 数据库测试开始 ===');
        
        // 测试初始化
        await dataStore.init();
        console.log('✅ 数据库初始化成功');
        
        // 测试设置
        await dataStore.setSetting('test', 'testValue');
        const testValue = await dataStore.getSetting('test', 'default');
        console.log('✅ 设置测试:', testValue === 'testValue' ? '成功' : '失败');
        
        // 测试标记
        const markId = await dataStore.addMark('testWord', 'testNote', null, null);
        console.log('✅ 添加标记成功，ID:', markId);
        
        const marks = await dataStore.getAllMarks();
        console.log('✅ 获取标记成功，数量:', marks.length);
        
        // 测试书籍
        const lastReadBook = await dataStore.getLastReadBook();
        console.log('✅ 最近阅读书籍:', lastReadBook ? lastReadBook.name : '无');
        
        // 清理测试数据
        await dataStore.deleteMark(markId);
        await dataStore.setSetting('test', null);
        console.log('✅ 测试数据清理完成');
        
        console.log('=== 数据库测试完成 ===');
    } catch (error) {
        console.error('❌ 数据库测试失败:', error);
    }
};

// 添加书籍数据检查方法
window.checkBookData = async function() {
    try {
        console.log('=== 书籍数据检查开始 ===');
        
        const lastReadBook = await dataStore.getLastReadBook();
        if (lastReadBook) {
            console.log('书籍名称:', lastReadBook.name);
            console.log('书籍大小:', lastReadBook.size);
            console.log('最后修改时间:', lastReadBook.lastModified);
            console.log('最后阅读时间:', lastReadBook.lastRead);
            console.log('数据字段存在:', !!lastReadBook.data);
            console.log('fileData字段存在:', !!lastReadBook.fileData);
            
            if (lastReadBook.data) {
                console.log('data长度:', lastReadBook.data.length);
                console.log('data前100字符:', lastReadBook.data.substring(0, 100));
            }
            
            if (lastReadBook.fileData) {
                console.log('fileData类型:', lastReadBook.fileData.constructor.name);
                console.log('fileData大小:', lastReadBook.fileData.byteLength);
            }
            
            // 检查其他字段
            console.log('所有字段:', Object.keys(lastReadBook));
        } else {
            console.log('没有找到书籍数据');
        }
        
        console.log('=== 书籍数据检查完成 ===');
    } catch (error) {
        console.error('❌ 书籍数据检查失败:', error);
    }
};
