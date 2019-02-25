import MessageBoardAPI, { commentData } from '../MessageBoardAPI.js';

class MessageBoardApp extends HTMLElement {
  constructor() {
    super();

    this.api = new MessageBoardAPI(commentData);
    this.state = {
      comments: [],
    };

    // event listeners
    this.addEventListener('removeComment', this.handleRemoveComment);
  }

  // takes in new pieces of state
  setState(newState) {
    // for each piece of state
    Object.keys(newState).forEach(key => {
      // update the correct key
      this.state[key] = newState[key];
      // select all child elements tracking this piece of state via attributes
      this.querySelectorAll(`[${key}]`).forEach(element => {
        // sets the attribute via the setter
        // element.setAttribute(key, newState[key])
        // elements["comments"] = value
        element[key] = newState[key];
      });
    });
  }

  connectedCallback() {
    this.api.getComments().then(comments => {
      this.setState({ comments });
    });
    this.render();
  }

  render() {
    this.innerHTML = /* html */ `
      <nav>
        <form>
          <input
            type="text"
            name="search"
            placeholder="Search"
          />
          <button type="submit">Search</button>
        </form>
      </nav>
      <message-board-comment-list></message-board-comment-list>
        <div class="add-comment">
          <form>
            <input
              type="text"
              name="comment"
              placeholder="Your opinion here"
            />
            <button type="submit">Comment</button>
          </form>
        </div>
    `;

    this.querySelector('message-board-comment-list').setAttribute('comments', JSON.stringify(this.state.comments));

    // add event listeners
    this.querySelector('nav form').addEventListener('submit', this.handleSearchSubmit);
    this.querySelector('.add-comment form').addEventListener('submit', this.handleAddComment);
  }

  handleSearchSubmit = async event => {
    event.preventDefault();
    const searchText = new FormData(event.target).get('search');
    // this.api.filterCommentsByText(searchText).then(updatedComments => this.setState({ comments: updatedComments }));
    const updatedComments = await this.api.filterCommentsByText(searchText);
    this.setState({ comments: updatedComments });
  };

  handleAddComment = event => {
    event.preventDefault();
    const commentText = new FormData(event.target).get('comment');
    event.target.reset();
    const updatedComments = this.api.addComment(commentText);
    this.setState({ comments: updatedComments });
  };

  handleRemoveComment = event => {
    const confirmed = window.confirm(`Really delete ${event.detail}?`);
    if (confirmed) {
      const updatedComments = this.api.removeComment(event.target.comment.id);
      this.setState({ comments: updatedComments });
    }
  };
}

export default MessageBoardApp;
