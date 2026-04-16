const StudyPlan = require('../models/StudyPlan');

const PLAN_TEMPLATES = {
  '7day': {
    title: '7-Day Sprint',
    tasks: [
      { day: 1, title: 'DSA Basics', description: 'Arrays & Strings problems', type: 'coding', difficulty: 'beginner' },
      { day: 1, title: 'Aptitude Warm-up', description: 'Quantitative reasoning', type: 'aptitude', difficulty: 'beginner' },
      { day: 1, title: 'HR Introduction', description: 'Tell me about yourself practice', type: 'hr', difficulty: 'beginner' },
      { day: 1, title: 'OS & System Basics', description: 'Processes, threads, memory concepts', type: 'technical', difficulty: 'beginner' },

      { day: 2, title: 'Linked Lists', description: 'Solve 2 linked list problems', type: 'coding', difficulty: 'beginner' },
      { day: 2, title: 'Number Series', description: 'Pattern and sequence problems', type: 'aptitude', difficulty: 'beginner' },
      { day: 2, title: 'Strengths & Weaknesses', description: 'Articulate personal strengths clearly', type: 'hr', difficulty: 'beginner' },
      { day: 2, title: 'OOP Concepts', description: 'Inheritance, polymorphism, encapsulation', type: 'technical', difficulty: 'beginner' },

      { day: 3, title: 'Stacks & Queues', description: 'Solve stack/queue problems', type: 'coding', difficulty: 'intermediate' },
      { day: 3, title: 'Logical Reasoning', description: 'Syllogism & deduction problems', type: 'aptitude', difficulty: 'beginner' },
      { day: 3, title: 'Why This Company?', description: 'Research & articulate motivation', type: 'hr', difficulty: 'intermediate' },
      { day: 3, title: 'DBMS Basics', description: 'SQL queries, normalization, joins', type: 'technical', difficulty: 'intermediate' },

      { day: 4, title: 'Trees & Recursion', description: 'Binary tree traversal problems', type: 'coding', difficulty: 'intermediate' },
      { day: 4, title: 'Time & Work', description: 'Speed, distance, time problems', type: 'aptitude', difficulty: 'intermediate' },
      { day: 4, title: 'STAR Method Practice', description: 'Behavioral questions with structure', type: 'hr', difficulty: 'intermediate' },
      { day: 4, title: 'Networking Basics', description: 'TCP/IP, HTTP, DNS concepts', type: 'technical', difficulty: 'intermediate' },

      { day: 5, title: 'Sorting Algorithms', description: 'Implement merge sort & quick sort', type: 'coding', difficulty: 'intermediate' },
      { day: 5, title: 'Numerical Aptitude', description: 'Percentages & profit-loss problems', type: 'aptitude', difficulty: 'intermediate' },
      { day: 5, title: 'Conflict Resolution', description: 'Difficult situation handling scenarios', type: 'hr', difficulty: 'intermediate' },
      { day: 5, title: 'Data Structures Theory', description: 'Compare time & space complexities', type: 'technical', difficulty: 'intermediate' },

      { day: 6, title: 'Dynamic Programming', description: 'Memoization: Fibonacci, knapsack', type: 'coding', difficulty: 'advanced' },
      { day: 6, title: 'Probability', description: 'Permutation, combination, probability', type: 'aptitude', difficulty: 'advanced' },
      { day: 6, title: 'Career Goals', description: 'Where do you see yourself in 5 years?', type: 'hr', difficulty: 'intermediate' },
      { day: 6, title: 'System Design Intro', description: 'Design a URL shortener', type: 'technical', difficulty: 'advanced' },

      { day: 7, title: 'Mock Coding Round', description: 'Solve 2 medium-level coding problems', type: 'coding', difficulty: 'advanced' },
      { day: 7, title: 'Aptitude Speed Test', description: 'Mixed 15-question timed test', type: 'aptitude', difficulty: 'advanced' },
      { day: 7, title: 'Full HR Simulation', description: 'Complete 30-min HR mock interview', type: 'hr', difficulty: 'advanced' },
      { day: 7, title: 'Full Technical Mock', description: 'End-to-end technical simulation', type: 'general', difficulty: 'advanced' }
    ]
  },
  '14day': {
    title: '14-Day Prep',
    tasks: [
      { day: 1, title: 'Arrays Fundamentals', description: 'Array manipulation problems', type: 'coding', difficulty: 'beginner' },
      { day: 1, title: 'Math Basics', description: 'Arithmetic & percentages', type: 'aptitude', difficulty: 'beginner' },
      { day: 1, title: 'HR Introduction', description: 'Personal strengths practice', type: 'hr', difficulty: 'beginner' },
      { day: 1, title: 'CS Fundamentals', description: 'Data types, memory, compilation', type: 'technical', difficulty: 'beginner' },

      { day: 2, title: 'String Problems', description: 'Reversal, palindrome, anagram', type: 'coding', difficulty: 'beginner' },
      { day: 2, title: 'Number Patterns', description: 'Series completion exercises', type: 'aptitude', difficulty: 'beginner' },
      { day: 2, title: 'Tell Me About Yourself', description: 'Craft a 2-minute elevator pitch', type: 'hr', difficulty: 'beginner' },
      { day: 2, title: 'OOP Basics', description: 'Classes, objects, interfaces', type: 'technical', difficulty: 'beginner' },

      { day: 3, title: 'Linked Lists', description: 'Singly & doubly linked list problems', type: 'coding', difficulty: 'beginner' },
      { day: 3, title: 'Logical Patterns', description: 'Syllogisms and deductions', type: 'aptitude', difficulty: 'beginner' },
      { day: 3, title: 'Strengths & Weaknesses', description: 'Frame weaknesses positively', type: 'hr', difficulty: 'beginner' },
      { day: 3, title: 'SQL Basics', description: 'SELECT, WHERE, JOIN queries', type: 'technical', difficulty: 'beginner' },

      { day: 4, title: 'Stacks & Queues', description: 'Implementation and application problems', type: 'coding', difficulty: 'intermediate' },
      { day: 4, title: 'Ratio & Proportion', description: 'Ratio, proportion, mixtures', type: 'aptitude', difficulty: 'beginner' },
      { day: 4, title: 'Teamwork Scenarios', description: 'Group work and collaboration questions', type: 'hr', difficulty: 'beginner' },
      { day: 4, title: 'OS Concepts', description: 'Process scheduling, deadlock, paging', type: 'technical', difficulty: 'intermediate' },

      { day: 5, title: 'Binary Trees', description: 'Inorder, preorder, postorder traversal', type: 'coding', difficulty: 'intermediate' },
      { day: 5, title: 'Verbal Reasoning', description: 'Passage comprehension & inference', type: 'aptitude', difficulty: 'intermediate' },
      { day: 5, title: 'Leadership Questions', description: 'Examples of leading/managing people', type: 'hr', difficulty: 'intermediate' },
      { day: 5, title: 'Networking Basics', description: 'OSI model, TCP/UDP, HTTP', type: 'technical', difficulty: 'intermediate' },

      { day: 6, title: 'Binary Search', description: 'Search variations: rotated array, range', type: 'coding', difficulty: 'intermediate' },
      { day: 6, title: 'Data Interpretation', description: 'Pie charts, bar graphs, tables', type: 'aptitude', difficulty: 'intermediate' },
      { day: 6, title: 'Why This Company?', description: 'Research company values and mission', type: 'hr', difficulty: 'intermediate' },
      { day: 6, title: 'DBMS Deep Dive', description: 'Normalization, transactions, indexing', type: 'technical', difficulty: 'intermediate' },

      { day: 7, title: 'Mini Mock - Technical', description: 'Technical round simulation (1 hr)', type: 'technical', difficulty: 'intermediate' },
      { day: 7, title: 'Aptitude Timed Quiz', description: '15-question mixed aptitude test', type: 'aptitude', difficulty: 'intermediate' },
      { day: 7, title: 'Mock HR Round', description: '20-min HR mock interview', type: 'hr', difficulty: 'intermediate' },
      { day: 7, title: 'Reflect & Review', description: 'Review weak areas from week 1', type: 'general', difficulty: 'intermediate' },

      { day: 8, title: 'Hashing Problems', description: 'HashMap frequency, grouping anagrams', type: 'coding', difficulty: 'intermediate' },
      { day: 8, title: 'Time & Work', description: 'Pipes, cisterns, work efficiency', type: 'aptitude', difficulty: 'intermediate' },
      { day: 8, title: 'Conflict Resolution', description: 'STAR answers for difficult situations', type: 'hr', difficulty: 'intermediate' },
      { day: 8, title: 'Design Patterns', description: 'Singleton, factory, observer patterns', type: 'technical', difficulty: 'intermediate' },

      { day: 9, title: 'Graph Basics', description: 'BFS, DFS, connected components', type: 'coding', difficulty: 'intermediate' },
      { day: 9, title: 'Probability', description: 'Probability, permutations, combinations', type: 'aptitude', difficulty: 'advanced' },
      { day: 9, title: 'Salary Negotiation', description: 'Salary expectation practice', type: 'hr', difficulty: 'intermediate' },
      { day: 9, title: 'REST API Concepts', description: 'HTTP methods, status codes, RESTful design', type: 'technical', difficulty: 'intermediate' },

      { day: 10, title: 'Sorting & Searching', description: 'Merge sort, quick sort, heap sort', type: 'coding', difficulty: 'advanced' },
      { day: 10, title: 'Critical Reasoning', description: 'Argument analysis, assumption spotting', type: 'aptitude', difficulty: 'advanced' },
      { day: 10, title: 'Career Goals', description: 'Long-term and short-term career planning', type: 'hr', difficulty: 'intermediate' },
      { day: 10, title: 'Cloud Basics', description: 'AWS/GCP services overview', type: 'technical', difficulty: 'advanced' },

      { day: 11, title: 'Dynamic Programming', description: 'Tabulation: LCS, coin change, LIS', type: 'coding', difficulty: 'advanced' },
      { day: 11, title: 'Mixed Aptitude Set', description: '20-question advanced problem set', type: 'aptitude', difficulty: 'advanced' },
      { day: 11, title: 'Personal Brand', description: 'Unique value proposition practice', type: 'hr', difficulty: 'advanced' },
      { day: 11, title: 'System Design: Cache', description: 'Design a caching system', type: 'technical', difficulty: 'advanced' },

      { day: 12, title: 'System Design Basics', description: 'Design a URL shortener end-to-end', type: 'technical', difficulty: 'advanced' },
      { day: 12, title: 'Advanced Aptitude', description: 'Speed test: 20 questions in 20 min', type: 'aptitude', difficulty: 'advanced' },
      { day: 12, title: 'Situational Leadership', description: 'Lead a failing project scenario', type: 'hr', difficulty: 'advanced' },
      { day: 12, title: 'Code Review Practice', description: 'Spot bugs in provided code snippets', type: 'coding', difficulty: 'advanced' },

      { day: 13, title: 'Full HR Simulation', description: 'Complete 45-min HR mock interview', type: 'hr', difficulty: 'advanced' },
      { day: 13, title: 'Advanced Graphs', description: 'Dijkstra, Kruskal, Topological sort', type: 'coding', difficulty: 'advanced' },
      { day: 13, title: 'System Design: DB', description: 'Design a scalable database schema', type: 'technical', difficulty: 'advanced' },
      { day: 13, title: 'Revision Sprint', description: 'Revise all aptitude formulas & shortcuts', type: 'aptitude', difficulty: 'advanced' },

      { day: 14, title: 'Full Technical Mock', description: 'Complete coding + technical round', type: 'coding', difficulty: 'advanced' },
      { day: 14, title: 'Full Aptitude Test', description: 'Timed 30-question comprehensive test', type: 'aptitude', difficulty: 'advanced' },
      { day: 14, title: 'Full HR Round', description: 'Final end-to-end HR simulation', type: 'hr', difficulty: 'advanced' },
      { day: 14, title: 'Full Simulation', description: 'Complete company interview simulation', type: 'general', difficulty: 'advanced' }
    ]
  },
  '30day': {
    title: '30-Day Complete Prep',
    tasks: Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const dayTasks = [
        { title: 'Coding Practice', description: `Day ${day} coding problems`, type: 'coding' },
        { title: 'Aptitude Quiz', description: `Day ${day} aptitude exercises`, type: 'aptitude' },
        { title: 'HR Practice', description: `Day ${day} behavioral questions`, type: 'hr' },
        { title: 'Technical Concepts', description: `Day ${day} technical theory`, type: 'technical' }
      ];
      const difficulties = ['beginner', 'beginner', 'beginner', 'intermediate', 'intermediate', 'intermediate', 'intermediate', 'advanced', 'advanced', 'advanced'];
      const diff = difficulties[Math.min(Math.floor(i / 3), difficulties.length - 1)];
      return dayTasks.map(t => ({ day, ...t, difficulty: diff }));
    }).flat()
  }
};

exports.getActivePlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ userId: req.userId, isActive: true });
    res.json({ plan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const { planType } = req.body;

    // Deactivate any existing active plan
    await StudyPlan.updateMany({ userId: req.userId, isActive: true }, { isActive: false });

    const template = PLAN_TEMPLATES[planType];
    if (!template) {
      return res.status(400).json({ message: 'Invalid plan type. Use 7day, 14day, or 30day' });
    }

    const plan = await StudyPlan.create({
      userId: req.userId,
      planType,
      startDate: new Date(),
      tasks: template.tasks,
      isActive: true
    });

    res.status(201).json({ plan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTodayTasks = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ userId: req.userId, isActive: true });
    if (!plan) return res.json({ tasks: [], message: 'No active plan' });

    const daysSinceStart = Math.floor((Date.now() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const todayTasks = plan.tasks.filter(t => t.day === daysSinceStart);

    res.json({ tasks: todayTasks, currentDay: daysSinceStart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const { taskDay, taskTitle } = req.body;
    const plan = await StudyPlan.findOne({ userId: req.userId, isActive: true });
    if (!plan) return res.status(404).json({ message: 'No active plan' });

    const task = plan.tasks.find(t => t.day === taskDay && t.title === taskTitle);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.completed = true;
    task.completedAt = new Date();
    plan.completedTasks = plan.tasks.filter(t => t.completed).length;
    await plan.save();

    res.json({ plan, message: 'Task completed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.cancelPlan = async (req, res) => {
  try {
    await StudyPlan.updateMany({ userId: req.userId, isActive: true }, { isActive: false });
    res.json({ message: 'Plan cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
