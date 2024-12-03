const JoinedPaper = require("../models/joined_papers")
const Paper = require("../models/paper")
const Request = require("../models/request")
const { get_paper } = require("./papersController")

const create_request = async (req, res) => {
    try {
        const user = res.locals.user
        const { paper_id } = req.params
        const paper = await get_paper(paper_id)

        const request = new Request({
            paper_id,
            sender: user._id,
            receiver: paper.user_id
        })
        request.save()
        res.json({ message: 'request sent successfully', user, request, paper })
    } catch (error) {
        console.log(error);

    }
}
const delete_request = async (req, res) => {
    const { paper_id } = req.params;
    const { user_id } = req.body;
    const user = res.locals.user;
    try {
        const request = await Request.deleteOne({
            paper_id,
            sender: user_id,
            receiver: user._id
        });
        if (request) {
            res.statu(200).json({ message: "Rejectd successfully" });
        } else {
            res.statu(500).json({ message: "Something went wrong" });
        }

    } catch (error) {
        res.statu(500).json({ error });

    }
}
const accept_request = async (req, res) => {
    const { paper_id } = req.params;
    const { user_id } = req.body;
    const user = res.locals.user;

    try {
        const paper = await get_paper(paper_id)

        if (paper) {
            const existing = await JoinedPaper.findOne({
                paper_id,
                user_id
            });

            if (existing) {
                return res.json({ message: 'This person has already joined the paper' });
            }

            // Create and save a new JoinedPaper entry
            const joinPaper = new JoinedPaper({
                paper_id,
                user_id
            });

            await joinPaper.save();


            await Request.deleteOne({
                paper_id,
                sender: user_id,
                receiver: user._id
            });

            // Send a response without circular structure
            res.json({ message: "Joined successfully", user: user._id, paper });
        }
        else {
            res.json({ message: "paper not found" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred" });
    }
};

const get_requests = async (req, res) => {
    const user = res.locals.user
    try {
        const requests = await Request.find({
            $or: [
                {
                    receiver: user._id
                },
                {
                    sender: user._id
                }
            ]
        })

        res.json({ requests })
    } catch (error) {

    }
}

module.exports = {
    create_request, get_requests, accept_request,delete_request
}