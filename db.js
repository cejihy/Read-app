// IndexedDB 数据存储管理器
class ReaderDataStore {
    constructor() {
        this.dbName = 'ReaderDB';
        this.dbVersion = 12; // 增加版本号以支持封面
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
    async addMark(word, groupId = null) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['marks'], 'readwrite');
            const store = transaction.objectStore('marks');
            const mark = {
                word,
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
    async addMarkGroup(name, words = [], note = '', imageData = null) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['markGroups'], 'readwrite');
            const store = transaction.objectStore('markGroups');
            const group = {
                name,
                words,
                note,
                imageData,
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











    // 提取EPUB封面
    async extractCover(bookFile) {
        try {
            // 使用JSZip解压EPUB文件
            const JSZip = window.JSZip;
            if (!JSZip) {
                console.warn('JSZip未加载，无法提取封面');
                return null;
            }

            const zip = new JSZip();
            await zip.loadAsync(bookFile);
            
            // 首先尝试简单方法：直接查找任何图片文件
            console.log('尝试简单方法：直接查找图片文件');
            const allFiles = Object.keys(zip.files);
            
            // 优化：只查找前20个文件，避免遍历整个EPUB
            const limitedFiles = allFiles.slice(0, 20);
            
            // 首先查找XHTML封面文件
            const xhtmlFiles = limitedFiles.filter(file => 
                /\.(xhtml|html|htm)$/i.test(file) && 
                (file.toLowerCase().includes('cover') || file.toLowerCase().includes('title'))
            );
            
            if (xhtmlFiles.length > 0) {
                console.log('找到XHTML封面文件:', xhtmlFiles[0]);
                const xhtmlFile = zip.file(xhtmlFiles[0]);
                const xhtmlContent = await xhtmlFile.async('string');
                
                // 查找img标签
                const imgMatch = xhtmlContent.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
                if (imgMatch) {
                    const imgSrc = imgMatch[1];
                    console.log('在XHTML中找到图片路径:', imgSrc);
                    
                    // 构建图片文件的完整路径
                    const xhtmlDir = xhtmlFiles[0].substring(0, xhtmlFiles[0].lastIndexOf('/') + 1);
                    const imgPath = imgSrc.startsWith('/') ? imgSrc.substring(1) : xhtmlDir + imgSrc;
                    console.log('图片完整路径:', imgPath);
                    
                    const imgFile = zip.file(imgPath);
                    if (imgFile) {
                        console.log('找到封面图片文件:', imgPath);
                        const imgExtension = imgPath.split('.').pop().toLowerCase();
                        const imgMimeType = imgExtension === 'png' ? 'image/png' : 
                                          imgExtension === 'gif' ? 'image/gif' : 'image/jpeg';
                        
                        const coverData = await imgFile.async('base64');
                        return `data:${imgMimeType};base64,${coverData}`;
                    }
                }
            }
            
            // 查找普通图片文件
            const imageFiles = limitedFiles.filter(file => 
                /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file) && 
                !file.includes('__MACOSX') && 
                !file.includes('.DS_Store') &&
                !file.includes('META-INF')
            );
            
            if (imageFiles.length > 0) {
                console.log('找到图片文件:', imageFiles);
                // 优先选择包含cover、title、front等关键词的图片
                const priorityImages = imageFiles.filter(file => 
                    /cover|title|front|book/i.test(file)
                );
                
                const selectedImage = priorityImages.length > 0 ? priorityImages[0] : imageFiles[0];
                console.log('选择图片文件:', selectedImage);
                
                const imageFile = zip.file(selectedImage);
                const extension = selectedImage.split('.').pop().toLowerCase();
                const mimeType = extension === 'png' ? 'image/png' : 
                               extension === 'gif' ? 'image/gif' : 'image/jpeg';
                
                const coverData = await imageFile.async('base64');
                return `data:${mimeType};base64,${coverData}`;
            }
            
            // 读取container.xml来找到OPF文件
            const containerFile = zip.file('META-INF/container.xml');
            if (!containerFile) {
                console.warn('无法找到container.xml');
                return null;
            }
            
            const containerXml = await containerFile.async('string');
            const opfMatch = containerXml.match(/full-path="([^"]+)"/);
            if (!opfMatch) {
                console.warn('无法找到OPF文件路径');
                return null;
            }
            
            const opfPath = opfMatch[1];
            const opfFile = zip.file(opfPath);
            if (!opfFile) {
                console.warn('无法找到OPF文件:', opfPath);
                return null;
            }
            
            const opfContent = await opfFile.async('string');
            
            // 尝试多种方式查找封面
            let coverHref = null;
            console.log('开始查找封面，OPF内容长度:', opfContent.length);
            
            // 方法1: 查找meta标签中的cover
            const coverMatch = opfContent.match(/<meta[^>]*name="cover"[^>]*content="([^"]+)"/);
            if (coverMatch) {
                console.log('找到meta cover标签:', coverMatch[1]);
                const coverId = coverMatch[1];
                const itemMatch = opfContent.match(new RegExp(`<item[^>]*id="${coverId}"[^>]*href="([^"]+)"`));
                if (itemMatch) {
                    coverHref = itemMatch[1];
                    console.log('通过meta cover找到封面:', coverHref);
                }
            }
            
            // 方法2: 查找id包含cover的item
            if (!coverHref) {
                const coverItemMatch = opfContent.match(/<item[^>]*id="([^"]*cover[^"]*)"[^>]*href="([^"]+)"/);
                if (coverItemMatch) {
                    coverHref = coverItemMatch[2];
                    console.log('通过id包含cover找到封面:', coverHref);
                }
            }
            
            // 方法3: 查找第一个图片文件
            if (!coverHref) {
                const imageMatch = opfContent.match(/<item[^>]*media-type="image\/(jpeg|png|gif)"[^>]*href="([^"]+)"/);
                if (imageMatch) {
                    coverHref = imageMatch[2];
                    console.log('通过第一个图片文件找到封面:', coverHref);
                }
            }
            
            // 方法4: 查找所有图片文件，选择第一个
            if (!coverHref) {
                const allImages = opfContent.match(/<item[^>]*media-type="image\/[^"]*"[^>]*href="([^"]+)"/g);
                if (allImages && allImages.length > 0) {
                    const firstImageMatch = allImages[0].match(/href="([^"]+)"/);
                    if (firstImageMatch) {
                        coverHref = firstImageMatch[1];
                        console.log('通过所有图片文件找到封面:', coverHref);
                    }
                }
            }
            
            // 方法5: 查找所有item，寻找可能的封面
            if (!coverHref) {
                const allItems = opfContent.match(/<item[^>]*>/g);
                if (allItems) {
                    console.log('所有item数量:', allItems.length);
                    for (const item of allItems) {
                        // 查找包含cover、title、front等关键词的item
                        if (item.includes('cover') || item.includes('title') || item.includes('front')) {
                            const hrefMatch = item.match(/href="([^"]+)"/);
                            if (hrefMatch) {
                                coverHref = hrefMatch[1];
                                console.log('通过关键词找到封面:', coverHref, 'item:', item);
                                break;
                            }
                        }
                    }
                }
            }
            
            if (!coverHref) {
                console.warn('无法找到封面文件，OPF内容片段:', opfContent.substring(0, 500));
                return null;
            }
            
            // 构建封面文件路径
            const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
            const coverPath = opfDir + coverHref;
            console.log('封面文件路径:', coverPath);
            
            const coverFile = zip.file(coverPath);
            if (!coverFile) {
                console.warn('无法找到封面文件:', coverPath);
                
                // 尝试不同的路径组合
                const possiblePaths = [
                    coverHref,
                    opfDir + coverHref,
                    coverHref.replace(/^\.\//, ''),
                    coverHref.replace(/^\.\//, opfDir),
                    'images/' + coverHref,
                    'Images/' + coverHref,
                    'image/' + coverHref,
                    'Image/' + coverHref
                ];
                
                for (const path of possiblePaths) {
                    console.log('尝试路径:', path);
                    const testFile = zip.file(path);
                    if (testFile) {
                        console.log('找到封面文件:', path);
                        const extension = path.split('.').pop().toLowerCase();
                        const mimeType = extension === 'png' ? 'image/png' : 
                                       extension === 'gif' ? 'image/gif' : 'image/jpeg';
                        
                        const coverData = await testFile.async('base64');
                        return `data:${mimeType};base64,${coverData}`;
                    }
                }
                
                // 如果还是找不到，列出所有可能的图片文件
                console.log('列出所有可能的图片文件:');
                const allFiles = Object.keys(zip.files);
                const imageFiles = allFiles.filter(file => 
                    /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file) && 
                    !file.includes('__MACOSX') && 
                    !file.includes('.DS_Store')
                );
                console.log('找到的图片文件:', imageFiles);
                
                if (imageFiles.length > 0) {
                    // 使用第一个图片文件
                    const firstImage = imageFiles[0];
                    console.log('使用第一个图片文件作为封面:', firstImage);
                    const imageFile = zip.file(firstImage);
                    const extension = firstImage.split('.').pop().toLowerCase();
                    const mimeType = extension === 'png' ? 'image/png' : 
                                   extension === 'gif' ? 'image/gif' : 'image/jpeg';
                    
                    const coverData = await imageFile.async('base64');
                    return `data:${mimeType};base64,${coverData}`;
                }
                
                return null;
            }
            
            // 检查是否是XHTML文件（封面页面）
            const extension = coverPath.split('.').pop().toLowerCase();
            if (extension === 'xhtml' || extension === 'html' || extension === 'htm') {
                console.log('找到XHTML封面文件，解析其中的图片...');
                const xhtmlContent = await coverFile.async('string');
                
                // 查找img标签
                const imgMatch = xhtmlContent.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
                if (imgMatch) {
                    const imgSrc = imgMatch[1];
                    console.log('在XHTML中找到图片路径:', imgSrc);
                    
                    // 构建图片文件的完整路径
                    const xhtmlDir = coverPath.substring(0, coverPath.lastIndexOf('/') + 1);
                    const imgPath = imgSrc.startsWith('/') ? imgSrc.substring(1) : xhtmlDir + imgSrc;
                    console.log('图片完整路径:', imgPath);
                    
                    const imgFile = zip.file(imgPath);
                    if (imgFile) {
                        console.log('找到封面图片文件:', imgPath);
                        const imgExtension = imgPath.split('.').pop().toLowerCase();
                        const imgMimeType = imgExtension === 'png' ? 'image/png' : 
                                          imgExtension === 'gif' ? 'image/gif' : 'image/jpeg';
                        
                        const coverData = await imgFile.async('base64');
                        return `data:${imgMimeType};base64,${coverData}`;
                    } else {
                        console.warn('无法找到XHTML中引用的图片文件:', imgPath);
                        
                        // 尝试不同的路径组合
                        const possibleImgPaths = [
                            imgSrc,
                            xhtmlDir + imgSrc,
                            imgSrc.replace(/^\.\//, ''),
                            imgSrc.replace(/^\.\//, xhtmlDir),
                            'images/' + imgSrc,
                            'Images/' + imgSrc,
                            'image/' + imgSrc,
                            'Image/' + imgSrc
                        ];
                        
                        for (const path of possibleImgPaths) {
                            console.log('尝试图片路径:', path);
                            const testImgFile = zip.file(path);
                            if (testImgFile) {
                                console.log('找到封面图片文件:', path);
                                const imgExt = path.split('.').pop().toLowerCase();
                                const imgMime = imgExt === 'png' ? 'image/png' : 
                                              imgExt === 'gif' ? 'image/gif' : 'image/jpeg';
                                
                                const coverData = await testImgFile.async('base64');
                                return `data:${imgMime};base64,${coverData}`;
                            }
                        }
                    }
                } else {
                    console.warn('XHTML文件中未找到img标签');
                }
                
                // 如果XHTML解析失败，回退到简单方法
                console.log('XHTML解析失败，使用简单方法查找图片...');
                const allFiles = Object.keys(zip.files);
                const imageFiles = allFiles.filter(file => 
                    /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file) && 
                    !file.includes('__MACOSX') && 
                    !file.includes('.DS_Store')
                );
                console.log('找到的图片文件:', imageFiles);
                
                if (imageFiles.length > 0) {
                    const firstImage = imageFiles[0];
                    console.log('使用第一个图片文件作为封面:', firstImage);
                    const imageFile = zip.file(firstImage);
                    const imgExt = firstImage.split('.').pop().toLowerCase();
                    const imgMime = imgExt === 'png' ? 'image/png' : 
                                  imgExt === 'gif' ? 'image/gif' : 'image/jpeg';
                    
                    const coverData = await imageFile.async('base64');
                    return `data:${imgMime};base64,${coverData}`;
                }
                
                return null;
            }
            
            // 处理普通图片文件
            const mimeType = extension === 'png' ? 'image/png' : 
                           extension === 'gif' ? 'image/gif' : 'image/jpeg';
            
            const coverData = await coverFile.async('base64');
            return `data:${mimeType};base64,${coverData}`;
            
        } catch (error) {
            console.warn('提取封面失败:', error);
            return null;
        }
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
                        
                        // 使用文件名检查是否已存在相同书籍
                        const getRequest = store.get(bookFile.name);
                        
                        getRequest.onsuccess = () => {
                            const existingBook = getRequest.result;
                            
                            if (existingBook) {
                                // 如果书籍已存在，更新最后阅读时间和文件信息
                                console.log('书籍已存在，更新阅读时间:', bookFile.name);
                                existingBook.lastRead = Date.now();
                                existingBook.lastModified = bookFile.lastModified;
                                existingBook.id = fileHash; // 更新文件哈希
                                
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
                                    name: bookFile.name, // 使用文件名作为主键
                                    id: fileHash, // 文件哈希作为唯一标识
                                    size: bookFile.size,
                                    lastModified: bookFile.lastModified,
                                    lastRead: Date.now(),
                                    fileData: e.target.result, // 直接存储ArrayBuffer
                                    coverData: null // 封面数据，稍后提取
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
                                    
                                    // 延迟异步提取封面，避免阻塞主流程
                                    setTimeout(async () => {
                                        try {
                                            const coverData = await this.extractCover(bookFile);
                                            if (coverData) {
                                                // 更新书籍记录，添加封面数据
                                                bookData.coverData = coverData;
                                                const updateTransaction = this.db.transaction(['books'], 'readwrite');
                                                const updateStore = updateTransaction.objectStore('books');
                                                const updateRequest = updateStore.put(bookData);
                                                updateRequest.onsuccess = () => {
                                                    console.log('封面保存成功:', bookFile.name);
                                                };
                                                updateRequest.onerror = () => {
                                                    console.warn('封面保存失败:', updateRequest.error);
                                                };
                                            }
                                        } catch (error) {
                                            console.warn('提取封面失败:', error);
                                        }
                                    }, 100); // 延迟100ms执行
                                    
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
        console.log('deleteBook被调用，参数:', bookName);
        
        if (!this.db) {
            console.log('数据库未初始化，正在初始化...');
            await this.init();
        }
        
        return new Promise((resolve, reject) => {
            try {
                console.log('创建数据库事务...');
                const transaction = this.db.transaction(['books'], 'readwrite');
                const store = transaction.objectStore('books');
                
                console.log('开始删除书籍:', bookName);
                // 直接尝试删除，因为主键是name
                const deleteRequest = store.delete(bookName);
                
                deleteRequest.onsuccess = () => {
                    console.log('书籍删除成功:', bookName);
                    resolve();
                };
                
                deleteRequest.onerror = () => {
                    console.error('删除书籍失败:', deleteRequest.error);
                    console.error('错误详情:', {
                        name: deleteRequest.error.name,
                        message: deleteRequest.error.message,
                        code: deleteRequest.error.code
                    });
                    // 如果删除失败，可能是因为书籍不存在，这种情况下我们视为成功
                    console.log('书籍可能不存在，视为删除成功');
                    resolve();
                };
                
                // 添加事务完成事件监听
                transaction.oncomplete = () => {
                    console.log('删除事务完成');
                };
                
                transaction.onerror = () => {
                    console.error('删除事务失败:', transaction.error);
                };
                
            } catch (error) {
                console.error('deleteBook函数内部错误:', error);
                console.error('错误堆栈:', error.stack);
                reject(error);
            }
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


    // 获取所有书籍
    async getAllBooks() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['books'], 'readonly');
            const store = transaction.objectStore('books');
            const request = store.getAll();

            request.onsuccess = () => {
                const books = request.result || [];
                // 按最后阅读时间排序
                books.sort((a, b) => (b.lastRead || 0) - (a.lastRead || 0));
                resolve(books);
            };

            request.onerror = () => {
                console.error('获取书籍列表失败:', request.error);
                reject(request.error);
            };
        });
    }

    // 更新书籍封面
    async updateBookCover(bookName) {
        if (!this.db) await this.init();
        
        return new Promise(async (resolve, reject) => {
            try {
                console.log('开始提取封面:', bookName);
                const book = await this.getBook(bookName);
                if (!book) {
                    console.warn('书籍不存在:', bookName);
                    reject(new Error('书籍不存在'));
                    return;
                }
                
                // 如果有封面数据，跳过
                if (book.coverData) {
                    console.log('书籍已有封面:', bookName);
                    resolve(book.coverData);
                    return;
                }
                
                // 从fileData创建File对象
                const bookFile = new File([book.fileData], book.name, {
                    type: 'application/epub+zip',
                    lastModified: book.lastModified
                });
                
                // 提取封面
                console.log('开始提取封面数据...');
                const coverData = await this.extractCover(bookFile);
                if (coverData) {
                    console.log('封面提取成功:', bookName);
                    // 更新书籍记录
                    book.coverData = coverData;
                    const transaction = this.db.transaction(['books'], 'readwrite');
                    const store = transaction.objectStore('books');
                    const request = store.put(book);
                    
                    request.onsuccess = () => {
                        console.log('封面保存成功:', bookName);
                        resolve(coverData);
                    };
                    
                    request.onerror = () => {
                        console.error('封面保存失败:', request.error);
                        reject(request.error);
                    };
                } else {
                    console.warn('封面提取失败，未找到封面:', bookName);
                    resolve(null);
                }
            } catch (error) {
                console.error('更新封面失败:', error);
                reject(error);
            }
        });
    }

    // 获取存储信息
    async getStorageInfo() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['settings', 'marks', 'markGroups', 'books', 'bookmarks'], 'readonly');
                
                const settingsStore = transaction.objectStore('settings');
                const marksStore = transaction.objectStore('marks');
                const groupsStore = transaction.objectStore('markGroups');
                const booksStore = transaction.objectStore('books');
                const bookmarksStore = transaction.objectStore('bookmarks');

                let totalSize = 0;
                let totalCount = 0;
                const results = {};

                // 获取设置数据
                const settingsRequest = settingsStore.getAll();
                settingsRequest.onsuccess = () => {
                    const settings = settingsRequest.result || [];
                    const settingsSize = JSON.stringify(settings).length;
                    results.settings = { count: settings.length, size: settingsSize };
                    totalSize += settingsSize;
                    totalCount += settings.length;
                };

                // 获取标记数据
                const marksRequest = marksStore.getAll();
                marksRequest.onsuccess = () => {
                    const marks = marksRequest.result || [];
                    const marksSize = JSON.stringify(marks).length;
                    results.marks = { count: marks.length, size: marksSize };
                    totalSize += marksSize;
                    totalCount += marks.length;
                };

                // 获取标记组数据
                const groupsRequest = groupsStore.getAll();
                groupsRequest.onsuccess = () => {
                    const groups = groupsRequest.result || [];
                    const groupsSize = JSON.stringify(groups).length;
                    results.markGroups = { count: groups.length, size: groupsSize };
                    totalSize += groupsSize;
                    totalCount += groups.length;
                };

                // 获取书籍数据
                const booksRequest = booksStore.getAll();
                booksRequest.onsuccess = () => {
                    const books = booksRequest.result || [];
                    let booksSize = 0;
                    books.forEach(book => {
                        // 计算书籍文件大小
                        if (book.fileData) {
                            booksSize += book.fileData.byteLength || 0;
                        }
                        // 计算其他字段大小
                        booksSize += JSON.stringify(book).length;
                    });
                    results.books = { count: books.length, size: booksSize };
                    totalSize += booksSize;
                    totalCount += books.length;
                };

                // 获取书签数据
                const bookmarksRequest = bookmarksStore.getAll();
                bookmarksRequest.onsuccess = () => {
                    const bookmarks = bookmarksRequest.result || [];
                    const bookmarksSize = JSON.stringify(bookmarks).length;
                    results.bookmarks = { count: bookmarks.length, size: bookmarksSize };
                    totalSize += bookmarksSize;
                    totalCount += bookmarks.length;
                };

                // 等待所有请求完成
                transaction.oncomplete = () => {
                    results.total = { count: totalCount, size: totalSize };
                    resolve(results);
                };

                transaction.onerror = () => {
                    reject(transaction.error);
                };

            } catch (error) {
                reject(error);
            }
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
