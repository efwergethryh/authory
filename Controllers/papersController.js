const Paper = require('../models/paper');
const JoinedPaper = require('../models/joined_papers');
const Conversation = require('../models/conversation');
const mongoose = require('mongoose')

async function generatePaperId() {
    let uniqueId;
    let isUnique = false;

    while (!isUnique) {
        uniqueId = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit number

        // Check if this ID already exists in the database
        const existingUser = await Paper.findOne({ _id: uniqueId });
        if (!existingUser) {
            isUnique = true;
        }
    }

    return uniqueId;
}
const create_paper =async (req, res) => {
    try {
        
        const id = res.locals.user._id;

        const body = req.body;
        const { type_of_study, project_branch, title, we_need, tags, language } = body;
        console.log('body',body);
        
        const paperId = await generatePaperId()
        const paper = new Paper({
            _id:`${paperId}`,
            type_of_study,
            title,
            we_need,
            tags,
            main_field:project_branch,
            user_id: id,
            language
        });
        await paper.save()
            
        res.status(200).json({ message: 'Paper added', paper })
    } catch (e) {
        res.status(500).json({ messsage: `Something went wrong ${e}` })
    }
};
const get_papers = async (user_id = null, res = null) => {
    try {
        if (res) {
            user_id = res.locals.user._id;
            const papers = await Paper.find({ user_id }).exec();
             return res.json({ papers });
        } else if (user_id) {
            const papers = await Paper.find({ user_id });
            return papers;
        } else {
            throw new Error('User ID is required.');
        }
    } catch (error) {
        console.error(error);
        if (res) {
            return res.json({ message: 'An error occurred' });
        } else {
            return 'Error fetching joined papers';
        }
    }
};
const search_papers = async (req, res) => {
    try {
        const { title, we_need, project_branch, id, language } = req.body;
        const myId = res.locals.user._id;

        
        let query = {};

        if (title) {
            // query.title = title;
            query.title = { $regex: title, $options: 'i' };
        }
        if (project_branch) {
            query.project_branch = project_branch;
        }
        if (we_need) {
            query.we_need = we_need;
        }
        if (id) {
            query._id = id;

        }
        if (language) {
            query.language = language;
        }

        // Execute the query

        
        let papers = await Paper.find(query);

        let joinedPapers =new Set()
        
        for (let paper of papers) {
            const joinedPaper = await JoinedPaper.find({ paper_id: paper._id, user_id: myId });
            if (joinedPaper.length > 0) {
                joinedPapers.add(paper._id.toString());  // Add paper._id to the Set if the user has joined
            }
        }
        console.log('joined papers',joinedPapers);
        joinedPapers  = Array.from(joinedPapers)
        res.status(200).json({ papers,joinedPapers});
    } catch (error) {
        console.error('Error searching papers:', error);
        res.status(500).json({ message: 'Error searching papers' });
    }
};
const get_paper = async (paper_id = null, req = null, res = null) => {
    try {
        let paper;

        if (req) {
            // Extract paper_id from the request parameters
            paper_id = req.params.paper_id; 

            // Use lean() if you want a plain JavaScript object instead of a Mongoose Document
            paper = await Paper.findById(paper_id).lean().exec();

            if (!paper) {
                return res.status(404).json({ message: 'Paper not found.' });
            } else {
                return res.json({ paper });
            }
        } else if (paper_id) {
            
            paper = await Paper.findById(paper_id);

            if (!paper) {
                throw new Error('Paper not found.');
            }

            return paper; // Return the paper object if found
        }
    } catch (err) {
        // Handle error response if res is provided
        if (res) {
            return res.status(500).json({ error: err.message });
        } else {
            console.error(err);
        }
    }
};  


const join_paper = async (req, res) => {
    try {

        const user_id = res.locals.user._id
        const { paper_id } = req.params

        const alreadyJoined = JoinedPaper.findById({ paper_id })
        const public_conv = await Conversation.findOne({ paper_id: paper_id, type: 'public' })
        const public_conv_id = public_conv._id.toString()
        // console.log('conversation', public_conv_id);



        if (alreadyJoined) {
            res.json({ message: "You already joined this paper", public_conv_id })
        } else {

            const joinedpaper = new JoinedPaper({
                user_id: user_id,
                paper_id: paper_id
            }
            )

            joinedpaper.save()
            res.json({ message: 'joined successfully', public_conv_id })
        }
    } catch (error) {
        console.log(error);
        res.json({ message: 'Error' })
    }
};

const get_joined_paper = async (user_id = null, req = null, res = null) => {
    
    try {
        
        
        // Determine user_id from request locals if not provided
        if (!user_id && res) {
            user_id = res.locals.user._id;
            

        }
        
        if (!user_id) {
            throw new Error('User ID is required.');
        }
        
        
        // Fetch joined paper IDs for the user
        const joinedpapers = await JoinedPaper.find({ user_id });
        // console.log('user ID',user_id,'joinedpapers',joinedpapers);
        
        const paperIds = joinedpapers.map((jp) => jp.paper_id); // Assuming `paper_id` field contains the ID

        // Fetch papers using Promise.all
        const joinedpapersData = await Promise.all(
            paperIds.map(async (paper_id) => {
                // console.log(`Fetching paper with ID: ${paper_id}`);
                return await get_paper(paper_id); // Directly call get_paper if it returns a promise
            })
        );
        
        if (res) {
            return res.json({ joinedpapers: joinedpapersData });
        }

        // If no response object, return joined papers
        return joinedpapersData;

    } catch (error) {
        console.error(error);
        // If response object is provided, send error message
        if (res) {
            return res.status(500).json({ message: 'An error occurred while fetching joined papers.' });
        } else {
            return 'Error fetching joined papers';
        }
    }
};

const joined_papers_users = async (req, res) => {
    const { paper_id } = req.params


    try {
        const Joinedpaper = await JoinedPaper.find({ paper_id })
        const joinedUsers = Joinedpaper.map((joinedPaper) => joinedPaper.user_id);

        res.json({ joinedUsers })
    } catch (error) {
        console.log(error);
    }
}
const delete_paper = async (req, res) => {
    const { paper_id } = req.params; // Extract the ID from req.params
    // console.log(paper_id);

    try {
        const paper = await Paper.findById(paper_id);
        // console.log('paper',paper);
        // Use await to resolve the promise
        if (paper) {
            await paper.deleteOne(); // Delete the paper if it exists
            res.status(200).json({ message: 'Paper deleted successfully' });
        } else {
            res.status(404).json({ message: 'Paper not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting paper', error });
    }
};

const update_paper = async (req, res) => {
    try {
        const { id } = req.params; // Get paper ID from the route parameters
        const { project_branch, type_of_study, we_need, paper_title, tags, language } = req.body;
        // Validate if the paper exists
        const paper = await Paper.findById(id);
        if (!paper) {
            return res.status(404).json({ error: 'Paper not found' });
        }
        // console.log('body',req.body);

        const updatedPaper = await Paper.findByIdAndUpdate(id, {
            project_branch,
            type_of_study,
            we_need,
            title: paper_title,
            tags,
            language
        }, {
            new: true,

        });

        return res.status(200).json({
            message: 'Paper updated successfully',
            paper: updatedPaper
        });
    } catch (error) {
        console.error('Error updating paper:', error);
        return res.status(500).json({
            error: 'An error occurred while updating the paper'
        });
    }
};
const delete_user_from_paper = async (req, res) => {
    try {
        const { paper_id } = req.params
        const { user_id } = req.body
        const joinedPaper = await JoinedPaper.findOne({ paper_id, user_id })
        // console.log('joined Paper',joinedPaper);

        if (joinedPaper) {
            await joinedPaper.deleteOne();
            res.json({ message: 'User removed successfully' })
        }
    } catch (err) {
        console.log(err);
    }
};



module.exports = {
    create_paper
    , get_papers
    , search_papers
    , join_paper
    , get_joined_paper
    , get_paper
    , delete_paper
    , update_paper
    , delete_user_from_paper
    , joined_papers_users
}