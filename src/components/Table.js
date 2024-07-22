import react from 'React';

function Table(){
    type user = {
        id: number
        name:string
        category: string
        subcategory:string
        createdAt:string
        upadatedAt:string
        price: number
        sale_price:number
      }
      const columnHelper= createColumnHelper<user>()
    return(
        
        
        
    );
}
export default Table;