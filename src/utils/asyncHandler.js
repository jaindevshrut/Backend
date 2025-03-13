// Method 1
const asyncHandler = (requestHandler) =>{ 
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch(err => next(err))
    }
}

export {asyncHandler}

// METHOD 2

/*
const asyncHandler = () => {}
const asyncHandler = (func) => {() => {}}
or 
const asyncHandler = (func) => () => {} explaing function ke andr function high level function

const asyncHandler = (func) => async (req, res, next) => {
    try{
        await func(req, res, next)
    }
    catch(error){
        res.status(error.code || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }
}
*/