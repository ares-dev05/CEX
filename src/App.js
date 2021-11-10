import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Index from './pages';
export default class App extends Component {
  state = {
    theme: localStorage.theme ? localStorage.theme : 'light',
  };
  
  componentDidMount(){
    if(this.state.theme == 'dark'){
      document.body.classList.toggle('dark');
    }
  }

  render() {
    return (
      <>
        <BrowserRouter>
          <Route component={ScrollToTop} />
          <ThemeProvider
            value={{
              data: this.state,
              update: () => {
                this.setState((state) => ({
                  theme:
                    state.theme === 'light'
                      ? (this.theme = 'dark')
                      : (this.theme = 'light'),
                }));
                var themestr = this.state.theme, index;
                index = themestr.indexOf('dark');
                if(index != -1){
                  localStorage.setItem('theme', 'light');
                }else{
                  localStorage.setItem('theme', 'dark');
                }
              },
            }}
          >
            <Index />
          </ThemeProvider>
        </BrowserRouter>
      </>
    );
  }
}

const ScrollToTop = () => {
  window.scrollTo(0, 0);
  return null;
};


