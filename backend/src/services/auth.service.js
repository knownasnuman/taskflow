

const bcrypt = require('bcryptjs');
const jwt  = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const generateAccessToken = (userId, email) => { 
     
    return jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: '15m'}
    );
};

const generateRefreshToken = (userId) => {

    return jwt.sign(
        {userId},
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d'}
    );
};

const refreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(decoded.userId, decoded.email);
    return { accessToken };
  } catch (error) {
    const err = new Error('Geçersiz refresh token');
    err.statusCode = 401;
    throw err;
  }
};

//REGISTER

const register = async ({name, email, password}) => {

        //email kayitlimi kontrolu
        const existingUser = await prisma.user.findUnique({
            where: {email}
        });

        if(existingUser){

            const error= new Error('Bu email zaten kayitli');
            error.statuCode = 400;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data : {
                name,
                email,
                password : hashedPassword,
            },

            select: { 
                id: true,
                name: true,
                email: true,
                createdAt: true,
            }
        });

        const accessToken = generateAccessToken(user.id, user.email);
        const refreshToken = generateRefreshToken(user.id);


        return { user, accessToken, refreshToken};
};

//LOGIN

const login = async ({email, password}) => {
    

    const user = await prisma.user.findUnique({
        where: {email}
    });

    if(!user) {
        const error = new Error('Email veya sifre hatali');
        error.statuCode = 401;
        throw error;
    }

    const isPassworValid = await bcrypt.compare(password, user.password);

    if(!isPassworValid){
        const error = new Error('Email veya sifre hatali');
        error.statusCode = 401;
        throw error;
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    return{
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        accessToken,
        refreshToken,
    };
};

module.exports = { register, login, refreshToken };













