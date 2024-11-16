

const registerationMiddleware = async (req, res,next) => {
    const {email,password} = req.cookies;
    
    console.log('middle ware email',email);
    
    if (email && password) {
        res.locals.email = email
        res.locals.password = password
        next()
    } else {
        res.redirect('/pages/register')
    }
};

module.exports =registerationMiddleware