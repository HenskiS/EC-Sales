module.exports = {
    apps: [{
        name: 'ecsales-server',
        cwd: '/apps/EC-Sales/server',
        script: 'index.js',
        exec_mode: 'cluster',
        instances: 1,
        wait_ready: true,
        listen_timeout: 15000,
        kill_timeout: 60000,
        restart_delay: 2000,
        max_memory_restart: '750M',
        time: true,
        env_production: {
            NODE_ENV: 'production',
        },
    }],
}
