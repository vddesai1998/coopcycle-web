<?php

namespace AppBundle\Domain\Order\Reactor;

use AppBundle\Domain\Order\Event;
use Predis\Client as Redis;
use Symfony\Component\Serializer\SerializerInterface;

class PublishToRedis
{
    private $redis;
    private $serializer;

    public function __construct(Redis $redis, SerializerInterface $serializer)
    {
        $this->redis = $redis;
        $this->serializer = $serializer;
    }

    public function __invoke(Event $event)
    {
        // $order = $event->getOrder();

        // // $channel = sprintf('order:%d:events', $order->getId());

        // // TODO Add username (or "owner") to event payload to allow filtering events
        // $message = [
        //     'name' => $event::messageName(),
        //     'data' => $event->toPayload(),
        //     // FIXME We should retrieve the actual date from EventStore
        //     'createdAt' => (new \DateTime())->format(\DateTime::ATOM),
        // ];

        $this->redis->publish(
            $event::messageName(),
            json_encode($this->createRedisMessage($event))
        );

        // if ($event instanceof Event\OrderCreated && $order->isFoodtech()) {

        //     // TODO Deprecate this
        //     $this->redis->publish(
        //         sprintf('restaurant:%d:orders', $order->getRestaurant()->getId()),
        //         $this->serializer->serialize($order, 'jsonld', ['groups' => ['order']])
        //     );

        //     $this->redis->publish(
        //         'order:created',
        //         $this->serializer->serialize($order, 'jsonld', ['groups' => ['order', 'place']])
        //     );
        // }
    }

    private function createRedisMessage(Event $event)
    {
        $order = $event->getOrder();

        return [
            'order' => $this->serializer->serialize($order, 'jsonld', ['groups' => ['order', 'place']]),
            'data' => $event->toPayload(),
            // FIXME We should retrieve the actual date from EventStore
            'createdAt' => (new \DateTime())->format(\DateTime::ATOM),
        ];
    }
}
