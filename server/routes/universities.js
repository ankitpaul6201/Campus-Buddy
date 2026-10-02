const express = require('express');
const router = express.Router();
const University = require('../models/University');
const College = require('../models/College');

// Common Indian educational acronyms mapped to full names
const INDIAN_ACRONYMS = {
  'sviet': 'Swami Vivekanand Institute of Engineering',
  'cu': 'Chandigarh University',
  'pu': 'Panjab University',
  'pec': 'Punjab Engineering College',
  'tiet': 'Thapar Institute',
  'thapar': 'Thapar',
  'chitkara': 'Chitkara',
  'vit': 'Vellore Institute of Technology',
  'iit': 'Indian Institute of Technology',
  'nit': 'National Institute of Technology',
  'iiit': 'Indian Institute of Information Technology',
  'bits': 'Birla Institute of Technology',
  'dtu': 'Delhi Technological University',
  'du': 'University of Delhi',
  'mahe': 'Manipal Academy of Higher Education',
  'bhu': 'Banaras Hindu University',
  'jnu': 'Jawaharlal Nehru University',
  'amu': 'Aligarh Muslim University',
  'lpu': 'Lovely Professional University',
  'srm': 'SRM University',
  'jntu': 'Jawaharlal Nehru Technological University',
  'anna': 'Anna University',
  'amity': 'Amity University',
  'iisc': 'Indian Institute of Science',
  'iim': 'Indian Institute of Management',
  'aiims': 'All India Institute of Medical Sciences',
  'nsut': 'Netaji Subhas',
  'igdtuw': 'Indira Gandhi Delhi Technical University'
};

// @route   GET /api/universities
// @desc    Search exclusively across 1,362 Universities and 54,244 Colleges from MongoDB Atlas
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { q, state, limit } = req.query;
    const trimmedQ = q && typeof q === 'string' ? q.trim() : '';

    if (!trimmedQ || trimmedQ.length < 2) {
      return res.json({
        success: true,
        count: 0,
        universities: []
      });
    }

    const lowerQ = trimmedQ.toLowerCase();
    const tokens = trimmedQ.split(/\s+/).filter(Boolean);
    const escapedFull = trimmedQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Build multi-token matching queries
    const buildUniTokenFilter = (token) => {
      const lower = token.toLowerCase();
      const exp = INDIAN_ACRONYMS[lower];
      const esc = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const orArr = [
        { name: { $regex: new RegExp(esc, 'i') } },
        { city: { $regex: new RegExp(esc, 'i') } },
        { state: { $regex: new RegExp(esc, 'i') } }
      ];
      if (exp) {
        const expEsc = exp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        orArr.push({ name: { $regex: new RegExp(expEsc, 'i') } });
      }
      return { $or: orArr };
    };

    const buildCollegeTokenFilter = (token) => {
      const lower = token.toLowerCase();
      const exp = INDIAN_ACRONYMS[lower];
      const esc = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const orArr = [
        { name: { $regex: new RegExp(esc, 'i') } },
        { rawName: { $regex: new RegExp(esc, 'i') } },
        { city: { $regex: new RegExp(esc, 'i') } },
        { district: { $regex: new RegExp(esc, 'i') } },
        { state: { $regex: new RegExp(esc, 'i') } },
        { universityName: { $regex: new RegExp(esc, 'i') } }
      ];
      if (exp) {
        const expEsc = exp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        orArr.push({ name: { $regex: new RegExp(expEsc, 'i') } });
        orArr.push({ rawName: { $regex: new RegExp(expEsc, 'i') } });
      }
      return { $or: orArr };
    };

    // Check if query is targeting SVIET / Swami Vivekanand
    const isSvietQuery = /sviet|swami\s*vivekanand/i.test(trimmedQ);

    // Primary query ($and of all tokens)
    const uniQuery = tokens.length > 1
      ? { $and: tokens.map(buildUniTokenFilter) }
      : buildUniTokenFilter(trimmedQ);

    const collegeQuery = tokens.length > 1
      ? { $and: tokens.map(buildCollegeTokenFilter) }
      : buildCollegeTokenFilter(trimmedQ);

    if (state && typeof state === 'string' && state.trim()) {
      uniQuery.state = { $regex: new RegExp(state.trim(), 'i') };
      collegeQuery.state = { $regex: new RegExp(state.trim(), 'i') };
    }

    const maxLimit = limit ? Math.min(parseInt(limit, 10), 150) : 100;

    // Search both MongoDB Atlas collections in parallel
    let [matchedUnis, matchedColleges] = await Promise.all([
      University.find(uniQuery)
        .select('name slug city state country logo website verified studentCount')
        .sort({ name: 1 })
        .limit(60)
        .lean(),
      College.find(collegeQuery)
        .select('aisheCode name rawName state district city website universityName collegeType')
        .sort({ name: 1 })
        .limit(100)
        .lean()
    ]);

    // If multi-word search produced few results, broaden with $or search
    if (tokens.length > 1 && (matchedUnis.length + matchedColleges.length) < 5) {
      const broadUniQuery = { $or: tokens.map(buildUniTokenFilter) };
      const broadCollegeQuery = { $or: tokens.map(buildCollegeTokenFilter) };
      if (state && typeof state === 'string' && state.trim()) {
        broadUniQuery.state = { $regex: new RegExp(state.trim(), 'i') };
        broadCollegeQuery.state = { $regex: new RegExp(state.trim(), 'i') };
      }

      const [broadUnis, broadColleges] = await Promise.all([
        University.find(broadUniQuery)
          .select('name slug city state country logo website verified studentCount')
          .sort({ name: 1 })
          .limit(40)
          .lean(),
        College.find(broadCollegeQuery)
          .select('aisheCode name rawName state district city website universityName collegeType')
          .sort({ name: 1 })
          .limit(80)
          .lean()
      ]);

      matchedUnis = [...matchedUnis, ...broadUnis];
      matchedColleges = [...matchedColleges, ...broadColleges];
    }

    // Always guarantee SVIET is included if user searched sviet
    if (isSvietQuery) {
      const svietCollege = await College.findOne({
        name: { $regex: /swami vivekanand institute of engineering/i }
      }).lean();
      if (svietCollege) {
        matchedColleges.unshift(svietCollege);
      }
    }

    const formatted = [];
    const seenNames = new Set();

    // 1. Add matching universities from MongoDB
    for (const u of matchedUnis) {
      const lower = u.name.toLowerCase();
      if (!seenNames.has(lower)) {
        seenNames.add(lower);
        formatted.push({
          id: u._id.toString(),
          _id: u._id.toString(),
          name: u.name,
          type: 'University',
          slug: u.slug || '',
          city: u.city || '',
          state: u.state || '',
          country: u.country || 'India',
          logo: u.logo || '',
          website: u.website || '',
          verified: u.verified !== false,
          source: 'database_university'
        });
      }
    }

    // 2. Add matching colleges from MongoDB
    for (const c of matchedColleges) {
      const lower = c.name.toLowerCase();
      if (!seenNames.has(lower)) {
        seenNames.add(lower);
        formatted.push({
          id: c._id.toString(),
          _id: c._id.toString(),
          name: c.name,
          type: c.collegeType || 'College',
          universityName: c.universityName || '',
          slug: c.slug || '',
          city: c.city || c.district || '',
          state: c.state || '',
          country: 'India',
          aisheCode: c.aisheCode || '',
          website: c.website || '',
          verified: true,
          source: 'database_college'
        });
      }
    }

    // Sort to prioritize items whose name directly includes the search query
    formatted.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aStarts = aName.startsWith(lowerQ);
      const bStarts = bName.startsWith(lowerQ);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      const aIncludes = aName.includes(lowerQ);
      const bIncludes = bName.includes(lowerQ);
      if (aIncludes && !bIncludes) return -1;
      if (!aIncludes && bIncludes) return 1;
      return aName.localeCompare(bName);
    });

    res.json({
      success: true,
      count: formatted.length,
      universities: formatted.slice(0, maxLimit)
    });
  } catch (err) {
    console.error('Error searching universities & colleges:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to search colleges',
      message: err.message
    });
  }
});

// @route   GET /api/universities/search
// @desc    Search universities and colleges (alias)
// @access  Public
router.get('/search', async (req, res) => {
  req.url = '/';
  return router.handle(req, res);
});

// @route   GET /api/universities/:id
// @desc    Get a single university or college by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let institution = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      institution = await University.findById(id).lean() || await College.findById(id).lean();
    }
    if (!institution) {
      institution = await University.findOne({ slug: id }).lean() || await College.findOne({ slug: id }).lean();
    }

    if (!institution) {
      return res.status(404).json({ success: false, error: 'Institution not found' });
    }

    res.json({
      success: true,
      university: {
        id: institution._id.toString(),
        _id: institution._id.toString(),
        name: institution.name,
        type: institution.collegeType || 'Institution',
        universityName: institution.universityName || '',
        city: institution.city || institution.district || '',
        state: institution.state || '',
        country: institution.country || 'India',
        website: institution.website || '',
        verified: true
      }
    });
  } catch (err) {
    console.error('Error fetching institution by id:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch details' });
  }
});

module.exports = router;
