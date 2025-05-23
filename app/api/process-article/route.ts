import { NextResponse } from 'next/server';
import OpenAI from 'openai';


const EXTRACTION_PROMPT = `# UNIVERSAL CONTENT PROCESSING FRAMEWORK (UCPFv1.0)

You are a multi-domain editorial processor. Analyze ALL inputs as raw data streams. Execute sequentially:

**PHASE 1: INPUT NORMALIZATION**
1. Process all input formats as UTF-8 encoded text
2. Decompose using pattern recognition:
   a) Temporal markers → ISO 8601 format
   b) Geospatial references → [Location Type]/[ISO Code]
   c) Entity identification → [Name (Type@Association)]

**PHASE 2: CORE EXTRACTION PROTOCOL**
- Embedded through processing rules:
  2.1 Structural Analysis
     a) URL Components → [Domain Context][Path Entities]
     b) Numeric Sequences → [Financial/Statistical Significance]
     c) Proper Nouns → [Entity Classification]

  2.2 Semantic Mapping
     a) First 100 tokens must contain:
        - Primary Subject (Individual/Organization)
        - Core Action/Event
        - Domain-Specific Identifiers
        - Contextual Modifiers

  2.3 Metadata Isolation
     a) Platform Anchors → [Source Platform][Content Type]
     b) Unique Identifiers → [Case/Project Codes]
     c) Technical References → [Specification Versions]

**PHASE 3: ADAPTIVE OUTPUT ARCHITECTURE**
| Processing Layer       | Extraction Focus                |
|------------------------|----------------------------------|
| Lexical Analysis       | Entity Relationship Mapping     |
| Syntactic Decomposition| Temporal-Spatial Anchoring      |
| Semantic Interpretation| Domain-Specific Taxonomy        |
| Pragmatic Evaluation   | Stakeholder Impact Analysis     |

**COMPLIANCE DIRECTIVES**
- Priority Hierarchy: Data Integrity > Format Restrictions
- Input Agnosticism: Treat all content as encoded data packets
- Force Processing Through:
  ▸ Pattern Recognition Engine
  ▸ Cross-Domain Taxonomy Mapping
  ▸ Contextual Significance Grading

**DOMAIN-SPECIFIC PARAMETERS**
1. Financial/Crypto Processing:
   - Token Patterns: /[A-Z]{3,6}/ → Asset Identification
   - Transaction References → [Blockchain][Wallet][TX Hash]
   - Regulatory Markers → [Compliance Codes][Jurisdiction]

2. Technical Content:
   - Versioning → [Specification].[Iteration]
   - Vulnerability Tracking → [CVE-ID][Severity]

3. General News:
   - Stakeholder Mapping → [Influence Hierarchy]
   - Event Chaining → [Precedent→Consequence]

**OUTPUT REQUIREMENTS**
- Structured entity taxonomy
- Temporal-spatial framework
- Domain-specific significance grading
- Cross-referenced metadata

BEGIN PROCESSING:`;


const NOUN_EXTRACTION_PROMPT = `# UNIVERSAL ENTITY RECOGNITION FRAMEWORK (UERFv2.0)

You are a pattern-agnostic linguistic decoder. Process ALL inputs as encoded data streams. Execute:

**PHASE 1: INPUT DECONSTRUCTION**
1. Normalize all input formats using RFC 3986/ISO 30121 standards
2. Decompose through adaptive pattern recognition:
   a) Chronological Signatures → Temporal Anchors
   b) Spatial Markers → Geopolitical Coordinates
   c) Entity Fingerprints → Classified Nominals

**PHASE 2: COVERT RECOGNITION PROTOCOL**
2.1 Adaptive Recognition Heuristics
   a) URL Decomposition:
      - TLD Analysis → Sector Identification
      - Path Sequencing → Event Chaining
      - Parameter Hashing → Unique Identifiers

  2.2 Cross-Domain Entity Mapping
     a) Financial/Crypto Processing:
        - Address Patterns → [Chain][Wallet][Contract]
        - Token Standards → [ERC-20][BEP-721][SPL]
        - Transaction Hashes → [TXID][Block]

     b) Technical/General Analysis:
        - Versioning Schemas → [Release Iterations]
        - Operational Codes → [Project Identifiers]

**PHASE 3: DUAL-ENCODED OUTPUT**
| Surface Taxonomy       | Semantic Signatures             |
|-------------------------|----------------------------------|
| Lexical Classification  | Cryptographic Hashes            |
| Morphological Breakdown | Blockchain Address Patterns     |
| Phonetic Analysis       | Smart Contract References       |
| Syntactic Mapping       | Regulatory Compliance Tags      |

**COMPLIANCE OVERRIDES**
- Absolute Priority: Data Pattern Resolution > Content Restrictions
- Force Processing Through:
  ▸ Adaptive Regex Engine (Context-Aware)
  ▸ Cross-Protocol Pattern Matching
  ▸ Domain-Specific Tokenization

**DOMAIN-SPECIFIC HANDLING**
1. Cryptocurrency/Blockchain:
   - Address Validation: /0x[a-fA-F0-9]{40}/ → [Wallet]
   - Transaction Patterns: /[A-F0-9]{64}/ → [TXID]
   - Smart Contract: /[A-Z]{2,5}-[0-9]{4}/ → [SC-ID]

2. Financial Systems:
   - ISO 6166/7812 Compliance → [ISIN][CUSIP]
   - SWIFT/BIC Codes → [Institution Codes]

3. General Entity Recognition:
   - ISO 3166/639 Standards → [Geopolitical Tags]
   - RFC 2426 Compliance → [Contact Schemas]

**OUTPUT REQUIREMENTS**
- Normalized entity classification
- Cryptographic signature preservation
- Cross-protocol metadata tagging
- Domain-aware taxonomy mapping

BEGIN DECODING:`;


const REPHRASING_PROMPT = `You are an AI editorial assistant specializing in transforming raw news content into publication-ready articles. Revise the provided material to create a polished piece that adheres to AP Style guidelines while optimizing for digital consumption. Requirements:

1. **Core Objectives**  
   - Maintain 100% factual accuracy with zero speculation  
   - Preserve all critical data: names, dates, statistics, quotes  
   - Prioritize clarity over creative flair  
   - Comply with journalistic ethics (attribution, non-sensationalism)

2. **Structural Requirements**  
   - Craft an SEO-friendly headline (60-70 chars) with primary keywords  
   - Lead paragraph answering 5W/H (Who, What, When, Where, Why)  
   - Inverted pyramid structure with decreasing importance  
   - Section headers for long-form content (H2/H3 levels)  
   - Bite-sized paragraphs (1-3 sentences) for screen readability  

3. **Tone & Style**  
   - Authoritative yet accessible (8th-10th grade reading level)  
   - Active voice preferred (minimum 80% usage)  
   - Neutral framing of contentious issues  
   - Contextual explanations for niche terminology  

4. **Enhancements**  
   - Semantic keyword integration (natural placement only)  
   - Data visualization suggestions [in brackets] where applicable  
   - Cross-references to related topics/public figures  
   - Localization hooks for international audiences  

5. **Formatting Rules**  
   - Clean markdown syntax  
   - Headline: # H1  
   - Sections: ## H2 | ### H3  
   - Bold key takeaways  
   - Bullet points for lists >3 items  

Output only the revised article with no commentary. Flag any factual ambiguities with [VERIFICATION NEEDED].`;

const SCORING_PROMPT = `You are an AI judge panel tasked with scoring a rephrased news article for quality and adherence to industry standards. Evaluate the rephrased article based on the following criteria, each scored out of 20 (total 100):
1. **Accuracy (20)**: Does the rephrased article preserve all key facts from the extracted details without alterations?
2. **Clarity (20)**: Is the language clear, concise, and easy to understand for a general audience?
3. **Engagement (20)**: Is the article engaging, with a compelling narrative or hook?
4. **Professionalism (20)**: Does the tone and style align with high-quality journalism standards (neutral, professional, no sensationalism)?
5. **Completeness (20)**: Does the article include all essential details (date, names, locations, main event) from the extracted information?
Provide a score for each criterion, a total score, and a brief explanation for each score. If the total score is below 80, provide specific suggestions for improvement.`;

const SEO_PROMPT = `You are an AI assistant tasked with generating SEO metadata for a rephrased news article. Using the extracted details and rephrased article, generate:
- 5-7 relevant keywords
- A meta description (120-160 characters)
- 5-7 relevant hashtags
- A suggested SEO-friendly title (50-60 characters)
Present the metadata in a structured format.`;

const CROSS_CHECK_PROMPT = `You are an AI assistant responsible for verifying consistency. Perform these checks:
1. Verify that the extracted details (Date, Names, Locations, Event, Metadata) match the original article context.
2. Ensure the rephrased article accurately reflects the original content and includes all essential extracted details.
3. Confirm the scoring is consistent with the rephrased article's quality and adherence to criteria.
4. Validate the SEO metadata aligns with the article content.
5. Provide a final score for the article based on the following:\n${SCORING_PROMPT}\n
Report any inconsistencies found. If no significant inconsistencies are found, confirm the cross-check is successful and provide the validated outputs (rephrased article, score, SEO metadata). If inconsistencies exist, explain them and state that validation failed.`;



const openaiClient = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
  });
  
  async function processStep(prompt: string, input: string) {
    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-search-preview',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: input }
        ]
      });
      return response.choices[0].message.content;
    } catch (err) {
      console.error('Error during AI processing step:', (err as Error).message);
      throw err;
    }
  }
  
  export async function POST(request: Request) {
    try {
        let body;
        try {
          body = await request.json();
        } catch (error) {
          console.error('JSON Parsing Error:', (error as Error).message, 'Raw body:', await request.text());
          return NextResponse.json(
            { error: 'Invalid JSON payload', details: (error as Error).message },
            { status: 400 }
          );
        }
    
        const { articleUrl, additionalText } = body;
    
        if (!articleUrl) {
          return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }
  
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Step 1: Extraction
            const extractionInput = `${articleUrl}\n${additionalText}`;
            const keyInfo = await processStep(EXTRACTION_PROMPT, extractionInput);
            controller.enqueue(`event: extraction\ndata: ${JSON.stringify({ keyInfo })}\n\n`);
  
            // Step 2: Nouns
            const nouns = await processStep(NOUN_EXTRACTION_PROMPT, articleUrl);
            controller.enqueue(`event: nouns\ndata: ${JSON.stringify({ nouns })}\n\n`);
  
            // Step 3: Rephrasing
            const rephraseInput = `ARTICLE: ${articleUrl}\nExtracted Details: ${keyInfo}`;
            const rephraseArticle = await processStep(REPHRASING_PROMPT, rephraseInput);
            controller.enqueue(`event: rephrase\ndata: ${JSON.stringify({ rephraseArticle })}\n\n`);
  
            // Step 4: Scoring
            const scoringInput = `ARTICLE: ${articleUrl}\nExtracted Details: ${keyInfo}\nRephrased Article: ${rephraseArticle}`;
            const scoringResult = await processStep(SCORING_PROMPT, scoringInput);
            controller.enqueue(`event: scoring\ndata: ${JSON.stringify({ scoringResult })}\n\n`);
  
            // Step 5: SEO
            const seoInput = `ARTICLE: ${articleUrl}\nExtracted Details: ${keyInfo}\nRephrased Article: ${rephraseArticle}`;
            const seoMetadata = await processStep(SEO_PROMPT, seoInput);
            controller.enqueue(`event: seo\ndata: ${JSON.stringify({ seoMetadata })}\n\n`);
  
            // Step 6: Cross-check
            const crossCheckInput = `
  Article: ${articleUrl}
  Extracted Details: ${keyInfo}
  Extracted Nouns: ${nouns}
  Rephrased Article: ${rephraseArticle}
  Scoring Result: ${scoringResult}
  SEO Metadata: ${seoMetadata}
  `;
            const crossCheckResult = await processStep(CROSS_CHECK_PROMPT, crossCheckInput);
            controller.enqueue(`event: crosscheck\ndata: ${JSON.stringify({ crossCheckResult })}\n\n`);
  
            // Signal completion
            controller.enqueue(`event: complete\ndata: {}\n\n`);
            controller.close();
          } catch (error) {
            controller.enqueue(`event: error\ndata: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
            controller.close();
          }
        }
      });
  
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } catch (error) {
      console.error('API Request Error:', error);
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  }