async function getAllJobs(req, res){

    const jobs = await Jobs.find({createdBy: req.user.id}).sort('createdAt')
    res.status(StatusCodes.OK).json({jobs, count: jobs.length})
    /* const {featured, company, name, sort, fields, numericFilters} = req.query;
    const queryObj = {};
    if (featured) {
        queryObj.featured = featured === 'true' ? 'true' : 'false';
    }
    if (company) {
        queryObj.company = company;
    }
    if (name) {
        queryObj.name = { $regex: name, $options: 'i' };
    }
    if (numericFilters) {
        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lte'
        }
        const regex = /\b(<|>|>=|=|<=)\b/g;
        let filters = numericFilters.replace(regex, (match)=>`-${operatorMap[match]}-`);
        const options = ['price', 'rating'];
        filters = filters.split(',').forEach(item => {
            const [field, operator, value] = item.split('-');
            if (options.includes(field)){
                queryObj[field] = { [operator] : Number(value) }
            }
        });
        
    }
    let result = Products.find(queryObj);
    if (sort) {
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList);
    } else {
        result = result.sort('createdAt');
    }
    if (fields) {
        const fieldsList = fields.split(',').join(' ');
        result = result.select(fieldsList);
    }
    

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page-1) * limit

    result = result.skip(skip).limit(limit);

    console.log(queryObj);
    
    const product = await result;
    
    res.status(200).json({product, nbHits: product.length}) */
}

const getJob = async (req, res)=>{    
    const jobId = req.params.id
    const job = await Jobs.findById(jobId)
    if (!job) {
        throw new notFoundError(`No job with id ${jobId}`);
    }

    if (job.createdBy != req.user.id) {
        throw new UnauthenticatedError("You're not authorized to access this job");
    }

    //other way of doing

    res.status(StatusCodes.OK).json({job});
}

const createJob = async (req, res)=>{
    req.body.createdBy = req.user.id;
    const job = await Jobs.create(req.body);
    res.status(StatusCodes.CREATED).json({job});
}

const updateJob = async (req, res)=>{
    const {body: {company, position}, user: {id}, params: {id: jobId}} = req;

    if (!company || !position) {
        throw new BadRequestError("Company or Position fields can not be empty");
    }

    const job = await Jobs.findByIdAndUpdate({_id: jobId, createdBy: id}, req.body, {new:true, runValidators: true});

    if (!job) {
        throw new notFoundError(`No job with id ${jobId}`);
    }

    res.status(StatusCodes.OK).json({job});
}

const deleteJob = async (req, res)=>{
    const {user: {id}, params: {id: jobId}} = req;

    const job = await Jobs.findByIdAndDelete({_id: jobId, createdBy: id});

    if (!job) {
        throw new notFoundError(`No job with id ${jobId}`);
    }

    res.status(StatusCodes.OK).json({msg:'job deleted successfully'});
}
