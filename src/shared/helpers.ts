export default {
    isProduction: () => { return process.env.NODE_ENV?.toLowerCase() === 'production' }
}