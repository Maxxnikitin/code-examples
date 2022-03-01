import React, { useCallback, FC } from 'react';
import styles from './burger-constructor.module.css';
import {
  ConstructorElement,
  Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import Total from '../total/total';
import { useDrop } from 'react-dnd';
import { useSelector, useDispatch } from 'react-redux';
import {
  ADD_INGREDIENT,
  DELETE_INGREDIENT,
  REORDER_INGREDIENTS,
} from '../../services/actions/constructor-ingredients';
import DraggableConstructorCard from '../draggable-constructor-card/draggable-constructor-card';
import { useHistory } from 'react-router-dom';
import { TIngredient } from '../../utils/types';

type TOnOrderClick = {
  onOrderClick: (e: React.SyntheticEvent, isBun: boolean) => void;
};

type TConstructorElement = TIngredient & {
  key: string;
};

const BurgerConstructor: FC<TOnOrderClick> = (props: TOnOrderClick) => {
  const { onOrderClick } = props;
  const dispatch = useDispatch();
  const history = useHistory();

  const { constructorIngredients } = useSelector(
    (state: any) => state.constructorIngredients
  );

  const bun = useSelector((state: any) => {
    return state.constructorIngredients.constructorIngredients.filter(
      (item: TIngredient) => item.type === 'bun'
    )[0];
  });

  const user = useSelector((state: any) => {
    return state.user.name;
  });

  const getTotalPrice = (state: any) => {
    let total = 0;
    state.constructorIngredients.map((item: TIngredient) =>
      item.type === 'bun' ? (total += item.price * 2) : (total += item.price)
    );
    return total;
  };

  const totalPrice = useSelector((state: any) => {
    return getTotalPrice(state.constructorIngredients);
  });

  const insideBun = useSelector((state: any) => {
    return state.constructorIngredients.constructorIngredients.filter(
      (item: TConstructorElement, i: number) => item.type !== 'bun'
    );
  });

  const onItemClick = (item: any) => {
    dispatch({
      type: DELETE_INGREDIENT,
      payload: item.key,
    });
  };

  const handleOrderClick = () => {
    if (user) {
      const isBun = constructorIngredients.some(
        (item: TIngredient) => item.type === 'bun'
      );
      onOrderClick(
        constructorIngredients.map((item: any) => (item = item._id)),
        isBun
      );
    } else {
      history.push('/login');
    }
  };

  const [, dropTarget] = useDrop({
    accept: 'ingredients',
    drop(item) {
      onDropHandler(item);
    },
  });

  const onDropHandler = (item: any) => {
    dispatch({
      type: ADD_INGREDIENT,
      payload: item,
    });
  };

  const moveCard = useCallback(
    (dragIndex, hoverIndex) => {
      const newCards = [...insideBun];
      newCards.splice(hoverIndex, 0, newCards.splice(dragIndex, 1)[0]);
      dispatch({ type: REORDER_INGREDIENTS, payload: newCards });
    },
    [insideBun, dispatch]
  );

  return (
    <section
      className={styles.section}
      ref={dropTarget}
      data-cy='constructor'
      onDrop={(e) => {
        e.preventDefault();
      }}
    >
      {constructorIngredients.length > 0 ? (
        <>
          {bun && (
            <div className={`mr-0 ml-0 mt-0 mb-4 ${styles.bun}`}>
              <ConstructorElement
                thumbnail={bun.image_mobile}
                text={bun.name}
                price={bun.price}
                isLocked={true}
                type='top'
              />
            </div>
          )}
          <ul className={`mr-0 ml-1 mt-0 mb-0 p-0 ${styles.list}`}>
            {insideBun.map((card: any, index: number) => (
              <DraggableConstructorCard
                item={card}
                onItemClick={onItemClick}
                key={card.key}
                index={index}
                id={card.key}
                moveCard={moveCard}
              />
            ))}
          </ul>
          {bun && (
            <div className={`mr-0 ml-0 mt-4 mb-0 ${styles.bun}`}>
              <ConstructorElement
                thumbnail={bun.image_mobile}
                text={bun.name}
                price={bun.price}
                isLocked={true}
                type='bottom'
              />
            </div>
          )}
          <div className={`pr-3 pl-3 pt-5 ${styles.order}`}>
            <Total sum={totalPrice} />
            <Button type='primary' size='large' onClick={handleOrderClick}>
              Оформить заказ
            </Button>
          </div>
        </>
      ) : null}
    </section>
  );
};

export default BurgerConstructor;
