const { connectToUserDb } = require('../config/db');
const { validateQueryRequest } = require('../utils/validator');
const { analyzeQueryExecution } = require('../services/analyzer');
const { suggestIndexes } = require('../services/indexSuggester');
const { estimatePerformanceGains } = require('../services/estimator');

const optimizeQuery = async (req, res) => {
    let client;
    try {
        const body = req.body;

        validateQueryRequest(body);

        const { mongoUri, database, collection, query, options } = body;

        client = await connectToUserDb(mongoUri);
        const db = client.db(database);

        const analysis = await analyzeQueryExecution(db, collection, query, options || {});

        const suggestions = suggestIndexes(query, options || {});

        const estimation = estimatePerformanceGains(analysis, suggestions);

        const issues = [];
        if (analysis.isFullScan) {
            issues.push('Query performs a full collection scan (COLLSCAN). An index is required for better performance.');
        }
        if (analysis.totalDocsExamined > 1000 && analysis.totalDocsExamined > analysis.totalKeysExamined * 10) {
            issues.push('High document examination ratio detected. The existing index (if any) is not highly selective.');
        }
        if (analysis.executionTimeMillis > 100) {
            issues.push('The query is slow (execution time > 100ms). Consider optimizing the index or reducing the data scanned.');
        }

        res.status(200).json({
            status: 'success',
            analysis,
            issues,
            suggestions,
            estimation
        });

    } catch (error) {
        console.error('Optimization failed:', error.message);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Something went wrong during query analysis.'
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { optimizeQuery };
