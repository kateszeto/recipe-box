import React from 'react';
//import {render} from 'react-dom';
import ReactDOM from 'react-dom';
import styles from './style.css';
import { createStore } from 'redux';
import { Button, ButtonToolbar, PanelGroup, Panel,Modal,ListGroup,ListGroupItem,Jumbotron } from 'react-bootstrap';
import {v4} from 'node-uuid';
import {Provider} from 'react-redux';
import PropTypes from 'prop-types';

/// Initialize /////////////////
var localStorage = require("store");

const loadState = ()=>{
    try{
    const serializedState = localStorage.get('recipeBox');
    if(typeof serializedState == 'undefined'){
        return undefined;
    }
    return serializedState;
    }catch(err){
        return undefined;
    }
};

const saveState = (state)=>{
    try{
 //       const serializedState = JSON.stringify(state);
        localStorage.set('recipeBox',state);
    }catch(err){
        ///Ignore err
    }
};

const configureStore = ()=>{
    const persistState = loadState();
    const store = createStore(recipes,persistState);
    store.subscribe(()=>{
    saveState(store.getState());});
    return store;
  
};

////////////////////////////////////

///// Redux ///////////////////////

const recipe = (state, action)=>{
    switch(action.type){
        case 'ADD_RECIPE':
            const addIng= action.ingredients.split(',');
 //           console.log("addIng: "+addIng);
            return  {
                id : action.id,
                name : action.name,
                ingredients : [...addIng]
            };
        case 'EDIT_RECIPE':
            if(state.id!==action.id){
                return state;
            }
            const editIng= action.ingredients.split(',');
            return {
                ...state,
                name : action.name,
                ingredients : [...editIng]
            };
  /*          
        case 'DELETE_RECIPE':
            return state;
*/            
        default:
            return state;
            
    }
};

const recipes = (state=[],action)=>{
    switch(action.type){
        case 'ADD_RECIPE':
          return [
        ...state,
        recipe(undefined, action)
      ];
        
        case 'EDIT_RECIPE':
            return state.map(r =>
        recipe(r, action)
      );
      
       case 'DELETE_RECIPE':
           const rId = action.id;
   //        console.log("action id:"+rId);
           return  state.filter(recipe=>recipe.id!==rId);
      
    
      default:
        return state;
    }
};





///// Action ///////////////////////////////////

const  addRecipe=(recipeName,recipeIng,store)=>{
        store.dispatch({
                    type: 'ADD_RECIPE',
                    id : v4(),
                    name: recipeName,
                    ingredients:recipeIng
                });

};

///// React ///////////////////////////////////

class EditRecipeModal extends React.Component{
       constructor(props) {
           super(props);

           this.state = {
               show: false,
               recipeName: '',
               ingreds: ''
           };
           
           this.handleName = this.handleName.bind(this);
           this.handleIngredients = this.handleIngredients.bind(this);
       }   
      
      componentDidMount() {
           this.setState({
               show: false,
               recipeName: this.props.recipe.name,
               ingreds: this.props.recipe.ingredients.join(',')
           });
        
    }
       
           handleName(e) {
    //           e.preventDefault();
               this.setState({
                   recipeName: e.target.value
               });
           }
           
          handleIngredients(e) {
   //            e.preventDefault();
              this.setState({
            ingreds: e.target.value
        });
        }
        
       render(){
                let close = () => this.setState({
                    show: false
                });
           return (
               <div >
        <Button
          bsStyle="primary" className="editRecipe"
          onClick={() => this.setState({ show: true})}
        >
          Edit Recipe
        </Button>

        <Modal
          show={this.state.show}
          onHide={close}
          container={this}
          aria-labelledby="contained-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title">Edit Recipe</Modal.Title>
          </Modal.Header>
          <Modal.Body>
           <h4>Recipe Name</h4>
           <input type="text" size="51" ref={node => {this.input = node;}} value={this.state.recipeName} onChange={ this.handleName } onInput={ this.handleName }/>
           <h4>Ingredients</h4>
           <textarea rows="4" cols="50" ref={node => {this.textarea = node;}} value={this.state.ingreds} onChange={this.handleIngredients} onInput={this.handleIngredients}/>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary"  onClick={()=>{this.props.onEdit( this.props.recipe.id,this.state.recipeName,this.state.ingreds);this.setState({show:false})}}>Edit Recipe</Button>
            <Button onClick={close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
           );
           }
}

const RecipePanel = ({recipes,onEdit,onDelete})=>{
      return (
          <div className="recipePanel">
      <PanelGroup  defaultActiveKey={null} accordion>
            {recipes.map((recipe,index)=>
             <Panel key={index} collapsible expanded={false} header={recipe.name} eventKey={recipe.id} bsStyle="info">
                <h4>Ingredients</h4>
                <div className="listGroup">
                 <ListGroup fill>
                {recipe.ingredients.map((ele,ind)=>
                  <ListGroupItem key={ind}>{ele}</ListGroupItem>
                )}
                </ListGroup>
                </div>
                <ButtonToolbar>
                 <Button bsStyle="danger" onClick={()=>onDelete(recipe.id)}>Delete</Button>
                
                <EditRecipeModal recipe={recipe} onEdit={onEdit}/>
                </ButtonToolbar>
                </Panel>
               
                     )}
      </PanelGroup>
      </div>
      );
};

class ShowRecipes extends React.Component{
    componentDidMount() {
        const {store} = this.context;
        this.unsubscribe = store.subscribe(() =>
            this.forceUpdate()
        );
    }
    render(){
        const props = this.props;
        const {store} = this.context;
        const recipes = store.getState();
        console.log(recipes);
        return (
            <RecipePanel recipes={recipes} onEdit={(id,name,ings)=>{
            
                store.dispatch({
                    type: 'EDIT_RECIPE',
                    id : id,
                    name: name,
                    ingredients:ings
                });
                
   //             console.log("id: "+id+" name: "+name+" ings: "+ings);
            }}
            onDelete={id=>{
            
                store.dispatch({
                    type: 'DELETE_RECIPE',
                    id : id
                });
//                console.log("to Delete: "+id);
            }}/>
            
            );
    }
}

ShowRecipes.contextTypes = {
  store: PropTypes.object
};


class AddRecipeModal extends React.Component{
         constructor(props) {
             super(props);

             this.state = {
                 show: false
             };

         }
       
        render(){
        const {store} = this.context;
        let close = () => this.setState({
            show: false
        });
        return (
            <div className="addRecipe">
        <Button
          bsStyle="primary"
          bsSize="large"
          onClick={() => this.setState({ show: true})}
        >
          Add Recipe
        </Button>

        <Modal
          show={this.state.show}
          onHide={close}
          container={this}
          aria-labelledby="contained-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title">Add a Recipe</Modal.Title>
          </Modal.Header>
          <Modal.Body>
           <h4>Recipe</h4>
           <input type="text" size="51" placeholder="Recipe Name" ref={node => {this.input = node;}}/>
           <h4>Ingredients</h4>
           <textarea rows="4" cols="50" placeholder="Enter Ingredients, Separated by Commas" ref={node =>{this.textarea = node;}}/>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary" onClick={()=>{
                addRecipe(this.input.value,this.textarea.value,store);
                this.setState({show:false});
                this.input = '';
                this.textarea = '';
            }}>Add Recipe</Button>
            <Button onClick={close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>);
        }
}

AddRecipeModal.contextTypes = {
  store: PropTypes.object
};

const Header = ()=>(
    <div className="header"><h1>Make your own Recipe Box</h1></div>
);

class RecipeBox extends React.Component {
    render(){
        
        return (
            <div>
             <Header/>
             <AddRecipeModal />
             
             <ShowRecipes />
            
            </div>
            );
    }
}


const store = configureStore();

ReactDOM.render(
        <Provider store = {store}>
        <RecipeBox />
        </Provider>,
        document.getElementById('root'));

