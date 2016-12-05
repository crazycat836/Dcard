/*
spider.fire 是否啟動爬蟲
spider.openTask 是否啟動定時任務
spider.interval 爬蟲時間間隔
*/
module.exports = {
    auth: '',
    mongo: {
        name: 'dcard',
        host: '127.0.0.1',
        port: 27017,
        username: 'crazycat836',
        password: 'cj8rclrcool',
        url: function() {
            return ['mongodb://',
                this.username, ':',
                this.password, '@',
                this.host, ':', this.port, '/', this.name
            ].join('');
        }
    },
    mongoOptions: {
        server: {
            poolSize: 1,
            socketOptions: {
                auto_reconnect: true
            }
        }
    },
    spider: {
        fire: false,
        openTask: false,
        interval: 10
    },
    fe: {
        developing: true
    }
}
