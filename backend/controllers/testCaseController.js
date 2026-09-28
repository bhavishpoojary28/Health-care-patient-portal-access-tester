const TestCase = require('../models/TestCase');
const TestExecution = require('../models/TestExecution');
const { executeAccessTest } = require('../services/testRunnerService');

const getAllTestCases = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};
    if (category && category !== 'ALL') query.category = category;
    if (status && status !== 'ALL') query.lastExecutionStatus = status;
    if (search) {
      query.$or = [
        { caseId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const cases = await TestCase.find(query).sort({ caseId: 1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve test cases' });
  }
};

const getTestCaseStats = async (req, res) => {
  try {
    const allCases = await TestCase.find();
    const totalTestCases = allCases.length;
    const passed = allCases.filter(c => c.lastExecutionStatus === 'PASS').length;
    const failed = allCases.filter(c => c.lastExecutionStatus === 'FAIL').length;
    const blocked = allCases.filter(c => c.lastExecutionStatus === 'BLOCKED').length;
    const notRun = allCases.filter(c => c.lastExecutionStatus === 'NOT_RUN').length;
    const passPercentage = totalTestCases > 0 ? Math.round((passed / totalTestCases) * 100) : 0;

    const categories = ['Authentication', 'Authorization', 'API', 'Security'];
    const categoryStats = categories.map(cat => {
      const catCases = allCases.filter(c => c.category === cat);
      const catPassed = catCases.filter(c => c.lastExecutionStatus === 'PASS').length;
      const catFailed = catCases.filter(c => c.lastExecutionStatus === 'FAIL').length;
      const catBlocked = catCases.filter(c => c.lastExecutionStatus === 'BLOCKED').length;
      return {
        category: cat,
        total: catCases.length,
        passed: catPassed,
        failed: catFailed,
        blocked: catBlocked,
        passPercentage: catCases.length > 0 ? Math.round((catPassed / catCases.length) * 100) : 0,
      };
    });

    res.json({ totalTestCases, passed, failed, blocked, notRun, passPercentage, categoryStats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute test statistics' });
  }
};

const createTestCase = async (req, res) => {
  try {
    const count = await TestCase.countDocuments();
    const caseId = req.body.caseId || `TC${String(count + 1).padStart(3, '0')}`;
    const tc = new TestCase({ ...req.body, caseId });
    await tc.save();
    res.status(201).json({ message: 'Created test case', testCase: tc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    const tc = await TestCase.findOneAndUpdate(
      { $or: [{ caseId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: req.body },
      { new: true }
    );
    res.json({ message: 'Updated', testCase: tc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    await TestCase.findOneAndDelete({
      $or: [{ caseId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const runSingleTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    const tc = await TestCase.findOne({
      $or: [{ caseId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });
    if (!tc) return res.status(404).json({ error: 'Not found' });

    let resourceType = 'profile';
    if (tc.targetEndpoint.includes('report')) resourceType = 'medical report';
    else if (tc.targetEndpoint.includes('prescription')) resourceType = 'prescriptions';
    else if (tc.targetEndpoint.includes('appointment')) resourceType = 'appointments';
    else if (tc.targetEndpoint.includes('billing')) resourceType = 'billing';

    const targetPatient = tc.targetPatientId || (tc.targetEndpoint.match(/P\d{4}/) ? tc.targetEndpoint.match(/P\d{4}/)[0] : 'P1001');

    const result = await executeAccessTest(req.app, {
      userRole: tc.roleUnderUser,
      userId: tc.testUser,
      targetPatientId: targetPatient,
      resourceType,
      action: tc.httpMethod,
    });

    tc.lastExecutionStatus = result.status;
    tc.lastRunDate = new Date();
    tc.lastExecutionMessage = `Status: ${result.actualStatus} | ${result.actualResult}`;
    await tc.save();

    res.json({ message: 'Executed', result, testCase: tc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const runAllTestCases = async (req, res) => {
  try {
    const cases = await TestCase.find().sort({ caseId: 1 });
    const runResults = [];
    for (const tc of cases) {
      let resourceType = 'profile';
      if (tc.targetEndpoint.includes('report')) resourceType = 'medical report';
      else if (tc.targetEndpoint.includes('prescription')) resourceType = 'prescriptions';
      else if (tc.targetEndpoint.includes('appointment')) resourceType = 'appointments';
      else if (tc.targetEndpoint.includes('billing')) resourceType = 'billing';

      const targetPatient = tc.targetPatientId || (tc.targetEndpoint.match(/P\d{4}/) ? tc.targetEndpoint.match(/P\d{4}/)[0] : 'P1001');
      const result = await executeAccessTest(req.app, {
        userRole: tc.roleUnderUser,
        userId: tc.testUser,
        targetPatientId: targetPatient,
        resourceType,
        action: tc.httpMethod,
      });

      tc.lastExecutionStatus = result.status;
      tc.lastRunDate = new Date();
      tc.lastExecutionMessage = `Status: ${result.actualStatus} | ${result.actualResult}`;
      await tc.save();
      runResults.push({ caseId: tc.caseId, status: result.status, actualStatus: result.actualStatus });
    }
    res.json({ message: `Executed ${runResults.length} tests`, results: runResults });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllTestCases, getTestCaseStats, createTestCase, updateTestCase, deleteTestCase, runSingleTestCase, runAllTestCases };
